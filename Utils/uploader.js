const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'YOUR_CLOUD_NAME',
    api_key: 'YOUR_API_KEY',
    api_secret: 'YOUR_API_SECRET'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'your-folder-name', // optional, specify folder name in Cloudinary
    allowedFormats: ['jpg', 'png', 'jpeg', 'gif'], // adjust as needed
});

const parser = multer({ storage: storage });

module.exports = { cloudinary, parser }