# Audio Files Directory

## For Podcasts:
Place your .mp3 files directly in this folder:
- `d:\gen-ai\musiccc\frontend\public\audio\`

## File Naming Convention:
Name your files clearly, for example:
- `episode-1-intro.mp3`
- `podcast-tech-talk-ep2.mp3`
- `my-podcast-episode-3.mp3`

## Access URLs:
Files will be accessible at:
- Frontend: `http://localhost:3000/audio/filename.mp3`
- Backend: `http://localhost:5000/audio/filename.mp3`

## Auto-import:
Run the script `npm run scan-podcasts` from the backend folder to automatically add files to the database.