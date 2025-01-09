const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Create test directories if they don't exist
const fs = require('fs');
const dirs = ['uploads', 'temp'];

dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '../../', dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
}); 