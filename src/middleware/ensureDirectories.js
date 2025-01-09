const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

function ensureDirectories(req, res, next) {
    const dirs = [
        process.env.UPLOAD_DIR || 'uploads',
        process.env.TEMP_DIR || 'temp'
    ];

    dirs.forEach(dir => {
        const dirPath = path.join(PROJECT_ROOT, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });

    next();
}

module.exports = ensureDirectories; 