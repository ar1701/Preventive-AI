const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    fileType: {
        type: String,
        enum: ['image', 'pdf', 'text'] // Ensures only one of these values is accepted
    },
    scanType: {
        type: String,
        enum: ['highLevel', 'lowLevel'] // Scan type can either be high-level or low-level
    },
    filePath: {
        type: String,
    },
    textInput: {
        type: String
    },
    cancerClass: {
        type: [String], // Array to hold the predicted cancer class
        default: [],    // Initialize as an empty array
    },
    uploadDate: {
        type: Date,
        default: Date.now // Automatically stores the date and time of upload
    }
});

// Create the Mongoose model from the schema
const CancerData = mongoose.model('Cancer Data', formDataSchema);

module.exports = CancerData;
