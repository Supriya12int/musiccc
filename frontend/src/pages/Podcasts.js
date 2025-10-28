import React, { useEffect, useState } from 'react';
import { podcastsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Podcasts = () => {
	const { user } = useAuth();
	const [podcasts, setPodcasts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [audioFile, setAudioFile] = useState(null);
	const [form, setForm] = useState({ title: '', host: '', description: '', duration: '', coverImage: '' });
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState('');

	useEffect(() => {
		loadPodcasts();
	}, []);

	const loadPodcasts = async () => {
		setLoading(true);
		try {
			const { data } = await podcastsAPI.getPodcasts();
			setPodcasts(data.podcasts || []);
		} catch (error) {
			console.error('Failed to load podcasts', error);
		} finally {
			setLoading(false);
		}
	};

	const handleFileChange = (e) => {
		setAudioFile(e.target.files?.[0] || null);
	};

	const handleUploadAudio = async () => {
		if (!audioFile) return setMessage('Please select an MP3 file');
		setBusy(true);
		setMessage('');
		try {
			const { data } = await podcastsAPI.uploadAudio(audioFile);
			setForm(prev => ({ ...prev, audioUrl: data.url }));
			setMessage('Audio uploaded. Fill details and click Create Podcast.');
		} catch (error) {
			setMessage('Upload failed: ' + (error.response?.data?.message || error.message));
		} finally {
			setBusy(false);
		}
	};

	const handleCreate = async () => {
		if (!form.title || !form.host || !form.duration || !form.audioUrl) return setMessage('Please fill required fields and upload audio');
		setBusy(true);
		setMessage('');
		try {
			await podcastsAPI.createPodcast({ ...form });
			setMessage('Podcast created');
			setForm({ title: '', host: '', description: '', duration: '', coverImage: '', audioUrl: '' });
			setAudioFile(null);
			loadPodcasts();
		} catch (error) {
			setMessage('Create failed: ' + (error.response?.data?.message || error.message));
		} finally { setBusy(false); }
	};

	return (
		<div className="max-w-5xl mx-auto p-6 text-white">
			<h1 className="text-3xl font-bold mb-4">Podcasts</h1>

			{message && <div className="mb-4 p-3 bg-gray-800 rounded">{message}</div>}

			{/* Upload Section (artists only) */}
			{user?.role === 'artist' && (
				<div className="mb-6 bg-gray-900 p-4 rounded">
					<h2 className="font-semibold mb-2">Upload Podcast (.mp3)</h2>
					<div className="mb-2">
						<input type="file" accept="audio/*" onChange={handleFileChange} />
						<button disabled={busy} onClick={handleUploadAudio} className="ml-3 px-3 py-1 bg-blue-600 rounded">{busy ? 'Uploading...' : 'Upload audio'}</button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<input placeholder="Title" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} className="p-2 bg-gray-800" />
						<input placeholder="Host" value={form.host} onChange={(e)=>setForm({...form, host:e.target.value})} className="p-2 bg-gray-800" />
						<input placeholder="Duration (seconds)" value={form.duration} onChange={(e)=>setForm({...form, duration:e.target.value})} className="p-2 bg-gray-800" />
						<input placeholder="Cover Image URL (optional)" value={form.coverImage} onChange={(e)=>setForm({...form, coverImage:e.target.value})} className="p-2 bg-gray-800" />
						<textarea placeholder="Description" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} className="p-2 bg-gray-800 md:col-span-2" />
					</div>
					<div className="mt-3">
						<button disabled={busy} onClick={handleCreate} className="px-4 py-2 bg-green-600 rounded">{busy ? 'Creating...' : 'Create Podcast'}</button>
					</div>
				</div>
			)}

			{/* Listing */}
			<div>
				{loading ? (
					<div>Loading podcasts...</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{podcasts.map(p => (
							<div key={p._id} className="bg-gray-900 p-4 rounded">
								<div className="flex">
									{p.coverImage ? <img src={p.coverImage} alt="cover" className="w-24 h-24 object-cover rounded mr-4" /> : <div className="w-24 h-24 bg-gray-700 rounded mr-4" />}
									<div className="flex-1">
										<h3 className="text-lg font-semibold">{p.title}</h3>
										<p className="text-sm text-gray-400">Host: {p.host}</p>
										<p className="text-sm text-gray-400">Duration: {Math.floor(p.duration/60)}:{(p.duration%60).toString().padStart(2,'0')}</p>
										<div className="mt-2">
											{p.audioUrl && <audio controls src={p.audioUrl} className="w-full" />}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Podcasts;
