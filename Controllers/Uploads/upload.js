const mediaUpload = async (req, res, cloudinary) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    try {
        console.log('Uploaded file:', req.file);
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).send(error);
                }
                console.log('Upload successful:', result);
                return res.json({ url: result.secure_url });
            }
        );
        stream.end(req.file.buffer);
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = { mediaUpload }