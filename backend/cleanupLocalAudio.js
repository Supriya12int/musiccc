const fs = require('fs');
const path = require('path');

const cleanupLocalAudioFiles = () => {
  const audioDir = path.join(__dirname, 'public', 'audio');
  
  console.log('🧹 Cleaning up local audio files...\n');
  console.log('Audio directory:', audioDir);
  
  if (!fs.existsSync(audioDir)) {
    console.log('❌ Audio directory does not exist');
    return;
  }

  const files = fs.readdirSync(audioDir);
  console.log(`Found ${files.length} files in audio directory:\n`);

  files.forEach((file, index) => {
    const filePath = path.join(audioDir, file);
    const stats = fs.statSync(filePath);
    
    console.log(`${index + 1}. ${file}`);
    console.log(`   Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Modified: ${stats.mtime.toDateString()}`);
    
    if (file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg')) {
      console.log('   Type: 🎵 Audio file');
      console.log('   Status: ✅ Safe to delete (stored on Cloudinary)');
    } else {
      console.log('   Type: 📄 Other file');
      console.log('   Status: ⚠️ Review before deleting');
    }
    console.log('');
  });

  console.log('💡 RECOMMENDATION:');
  console.log('Since your audio files are now on Cloudinary, you can safely delete local copies.');
  console.log('This will:');
  console.log('✅ Free up local disk space');
  console.log('✅ Prevent confusion about which files are being used');
  console.log('✅ Make deployment packages smaller');
  console.log('\nTo delete audio files, uncomment the deletion code below and run again.');
  
  // UNCOMMENT THESE LINES TO ACTUALLY DELETE FILES:
  /*
  console.log('\n🗑️ Deleting audio files...');
  files.forEach(file => {
    if (file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg')) {
      const filePath = path.join(audioDir, file);
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${file}`);
    }
  });
  console.log('🎉 Local audio cleanup completed!');
  */
};

cleanupLocalAudioFiles();