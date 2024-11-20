// image_processor.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

async function downloadImage(url, tempDir) {
  return new Promise((resolve, reject) => {
    const fileName = crypto.randomBytes(16).toString('hex') + '.jpg';
    const filePath = path.join(tempDir, fileName);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(filePath);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function extractTextFromImage(imageUrl) {
  const tempDir = path.join(__dirname, 'temp');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  try {
    // Download the image
    const imagePath = await downloadImage(imageUrl, tempDir);

    // Run Python script
    const result = await new Promise((resolve, reject) => {
      const pythonScript = spawn('python3', [
        path.join(__dirname, 'gemini_processor.py'),
        imagePath
      ]);

      let outputData = '';
      let errorData = '';

      pythonScript.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonScript.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonScript.on('close', (code) => {
        // Clean up downloaded image
        fs.unlink(imagePath, () => {});

        if (code !== 0) {
          reject(new Error(`Python script failed: ${errorData}`));
          return;
        }

        // Extract the actual text from the output
        const match = outputData.match(/Extracted Text:\n([\s\S]*)/);
        resolve(match ? match[1].trim() : '');
      });
    });

    return result;

  } catch (error) {
    throw new Error(`Failed to process image: ${error.message}`);
  } finally {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.readdirSync(tempDir).forEach(file => {
        const filePath = path.join(tempDir, file);
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Failed to delete temp file ${filePath}:`, err);
        }
      });
    }
  }
}

module.exports = extractTextFromImage;