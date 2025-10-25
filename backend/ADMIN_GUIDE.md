# Backend Admin Tools

## New Simplified Structure

Instead of 30+ individual script files, use the consolidated **Admin CLI**:

### Quick Start

```bash
# Interactive mode (shows all options)
npm run admin

# Or directly:
node admin-cli.js
```

### Direct Commands

```bash
# Song Management
npm run admin:songs list      # List all songs
npm run admin:songs add       # Add new song
npm run admin:songs clear     # Delete all songs
npm run admin:songs reset     # Reset to 3 sample songs

# Audio Management  
npm run admin:audio updateUrls  # Update audio URLs
npm run admin:audio verify      # Verify Cloudinary uploads

# Data Operations
npm run admin:seed              # Seed sample data
```

## What This Replaces

### Old Way (30+ files):
- `addSong.js` → `admin-cli.js song add`
- `listSongs.js` → `admin-cli.js song list`
- `clearAllSongs.js` → `admin-cli.js song clear`
- `addLyrics.js` → `admin-cli.js song lyrics`
- `updateCloudinaryUrls.js` → `admin-cli.js audio updateUrls`
- `verifyCloudinary.js` → `admin-cli.js audio verify`
- `seedDatabase.js` → `admin-cli.js seed`
- And 25+ more files...

### New Way (2 files):
- `admin-cli.js` - Main CLI tool
- `utils/database-utils.js` - Reusable functions

## Benefits

✅ **One command** instead of remembering 30+ filenames  
✅ **Interactive menu** shows all available options  
✅ **Consistent error handling** across all operations  
✅ **No duplicate code** - shared utilities  
✅ **Easy to extend** - add new commands in one place  

## File Structure

```
backend/
├── admin-cli.js              # 🆕 Main admin interface
├── utils/
│   └── database-utils.js      # 🆕 Reusable DB functions  
├── server.js                 # Main server (unchanged)
├── models/                   # DB models (unchanged)
├── routes/                   # API routes (unchanged)
└── services/                 # Business logic (unchanged)
```

## Legacy Files

The old individual `.js` files are still there but can be deleted once you're comfortable with the new CLI. They're now replaced by the consolidated system.

## Adding New Operations

To add a new admin operation, edit `admin-cli.js` and add it to the appropriate section (songOperations, audioOperations, etc.). Much easier than creating a new file each time!