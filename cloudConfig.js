const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary configuration using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

// Set up CloudinaryStorage with allowed formats
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Cancer_Detection",  // Cloudinary folder name
    allowedFormats: ["png", "jpeg", "jpg", "pdf"],  // Allowed file formats
    fileFilter: (req, file) => {
      // Define allowed MIME types for file upload
      const allowedMimeTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf"
      ];

      // Check if the file's MIME type is allowed
      if (file.mimetype === 'application/pdf') {
        // Accept the file
        return true;
      } else {
        // Reject the file
        return false;
      }
    }
  },
});

module.exports = { cloudinary, storage };
