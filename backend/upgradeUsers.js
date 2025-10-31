const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const upgradeUserToArtist = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    // Find users who might want to be artists (anyone who isn't admin)
    const users = await User.find({ role: 'user' });
    
    console.log(`Found ${users.length} regular users`);
    
    if (users.length > 0) {
      console.log('\nCurrent users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
      });
      
      // Upgrade all users to artists (since they probably want to upload music)
      const result = await User.updateMany(
        { role: 'user' },
        { $set: { role: 'artist' } }
      );
      
      console.log(`\n✅ Upgraded ${result.modifiedCount} users to artist role`);
      
      // Show updated users
      const updatedUsers = await User.find({ role: 'artist' });
      console.log('\nUpdated users:');
      updatedUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
      });
    } else {
      console.log('No regular users found to upgrade');
    }

    // Show all users and their roles
    const allUsers = await User.find({});
    console.log('\n📊 All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('Error upgrading users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

upgradeUserToArtist();