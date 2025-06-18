// backend/controllers/fileUploadController.js
const { s3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, getSignedUrl } = require('../config/aws');
const Client = require('../models/Client');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid'); // For unique filenames

// Configure Multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.uploadMiddleware = upload.single('file'); // 'file' is the field name for the uploaded file

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const { clientId } = req.body;
        if (!clientId) {
            return res.status(400).json({ message: 'Client ID is required.' });
        }

        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }

        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `<span class="math-inline">\{uuidv4\(\)\}\-</span>{Date.now()}.${fileExtension}`; // Unique filename
        const key = `client-documents/<span class="math-inline">\{clientId\}/</span>{fileName}`;

        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        const fileUrl = `https://<span class="math-inline">\{process\.env\.AWS\_S3\_BUCKET\_NAME\}\.s3\.</span>{process.env.AWS_REGION}.amazonaws.com/${key}`;

        // Store file metadata in MongoDB
        client.fileUrls.push({
            fileName: req.file.originalname,
            url: fileUrl,
            uploadedBy: req.user.id, // User who uploaded
        });
        await client.save();

        res.status(201).json({ message: 'File uploaded successfully', fileUrl, fileName: req.file.originalname });

    } catch (error) {
        console.error('Error uploading file to S3:', error);
        res.status(500).json({ message: 'Failed to upload file', error: error.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { clientId, fileUrl } = req.body;

        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }

        // Find and remove the file from client's fileUrls array
        const initialLength = client.fileUrls.length;
        client.fileUrls = client.fileUrls.filter(file => file.url !== fileUrl);

        if (client.fileUrls.length === initialLength) {
            return res.status(404).json({ message: 'File URL not found for this client.' });
        }

        // Extract the S3 key from the URL
        const urlParts = fileUrl.split(`https://<span class="math-inline">\{process\.env\.AWS\_S3\_BUCKET\_NAME\}\.s3\.</span>{process.env.AWS_REGION}.amazonaws.com/`);
        if (urlParts.length < 2) {
            return res.status(400).json({ message: 'Invalid file URL for S3 deletion.' });
        }
        const keyToDelete = urlParts[1];

        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: keyToDelete,
        };

        await s3Client.send(new DeleteObjectCommand(deleteParams));
        await client.save();

        res.status(200).json({ message: 'File deleted successfully.' });

    } catch (error) {
        console.error('Error deleting file from S3:', error);
        res.status(500).json({ message: 'Failed to delete file', error: error.message });
    }
};

exports.getSignedFileUrl = async (req, res) => {
    try {
        const { clientId, fileUrl } = req.query; // Expect fileUrl from query params

        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }

        // Ensure the fileUrl exists for this client to prevent unauthorized access to random S3 files
        const fileExists = client.fileUrls.some(file => file.url === fileUrl);
        if (!fileExists) {
            return res.status(403).json({ message: 'Access denied to this file.' });
        }

        // Extract the S3 key from the URL
        const urlParts = fileUrl.split(`https://<span class="math-inline">\{process\.env\.AWS\_S3\_BUCKET\_NAME\}\.s3\.</span>{process.env.AWS_REGION}.amazonaws.com/`);
        if (urlParts.length < 2) {
            return res.status(400).json({ message: 'Invalid file URL for S3.' });
        }
        const keyToSign = urlParts[1];

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: keyToSign,
        });

        // Generate a pre-signed URL that expires in 15 minutes (default)
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 900 seconds = 15 minutes

        res.status(200).json({ signedUrl });

    } catch (error) {
        console.error('Error generating signed URL:', error);
        res.status(500).json({ message: 'Failed to generate signed URL', error: error.message });
    }
};