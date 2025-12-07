const multer = require('multer');

// Gunakan memoryStorage agar file tersedia di req.file.buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung! Hanya boleh JPG/PNG.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2 // Batas 2MB (Jangan terlalu besar agar DB tidak berat)
    },
    fileFilter: fileFilter
});

module.exports = upload;