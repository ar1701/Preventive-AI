// run.js
const extractTextFromImage = require('./image_processor');

async function processImage(url) {
  try {
    if (!url) {
      throw new Error('Image URL is required');
    }
    
    const extractedText = await extractTextFromImage(url);
    
    if (!extractedText) {
      throw new Error('No text could be extracted from the image');
    }
    
    console.log('Successfully extracted text from image');
    return extractedText;
    
  } catch (error) {
    console.error('Error in processImage:', error);
    throw new Error(`Text extraction failed: ${error.message}`);
  }
}

module.exports = processImage;