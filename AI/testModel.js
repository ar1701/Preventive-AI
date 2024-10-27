const http = require('http');
const https = require('https');
const FormData = require('form-data');
const stream = require('stream');
const { promisify } = require('util');

// Configuration
const HOST = '43.133.109.85';
const PORT = 8080;
const PATH = '/predict';
const MODEL_VERSION = 3; // Choose a version between 0 and 6

// Function to fetch image from URL and return as a stream
function getImageFromUrl(imageUrl) {
  return new Promise((resolve, reject) => {
    // Choose protocol based on URL
    const client = imageUrl.startsWith('https') ? https : http;
    
    client.get(imageUrl, (response) => {
      // Check if response is successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch image: ${response.statusCode}`));
        return;
      }

      // Check if content type is an image
      const contentType = response.headers['content-type'];
      if (!contentType?.startsWith('image/')) {
        reject(new Error(`URL does not point to an image: ${contentType}`));
        return;
      }

      resolve(response);
    }).on('error', reject);
  });
}

async function testModel(imageUrl) {
  try {
    // Get image stream from URL
    const imageStream = await getImageFromUrl(imageUrl);

    // Create form data
    const form = new FormData();
    form.append('file', imageStream, {
      filename: 'image' + (imageUrl.match(/\.(jpg|jpeg|png|gif)$/i)?.[0] || '.jpg'),
      contentType: imageStream.headers['content-type']
    });

    // Set up the request options
    const options = {
      hostname: HOST,
      port: PORT,
      path: `${PATH}?version=${MODEL_VERSION}`,
      method: 'POST',
      headers: {
        ...form.getHeaders(),
      },
      timeout: 30000, // 30 seconds
    };

    return new Promise((resolve, reject) => {
      // Create the request
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            const predictedClass = result.predicted_class;
            resolve(predictedClass);
          } catch (error) {
            reject(new Error(`Error parsing response: ${error.message}\nRaw response: ${data}`));
          }
        });
      });

      // Error handling
      req.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });

      // Pipe the form data to the request
      form.pipe(req);

      // Upload progress tracking
      let uploaded = 0;
      form.on('data', (chunk) => {
        uploaded += chunk.length;
        // console.log(`Uploaded: ${uploaded} bytes`);
      });

      form.on('error', (error) => {
        reject(new Error(`Form data error: ${error.message}`));
      });
    });
  } catch (error) {
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

// Simple connection test before making the actual request
async function testConnection() {
  return new Promise((resolve, reject) => {
    const test = http.request({
      hostname: HOST,
      port: PORT,
      path: '/',
      method: 'GET',
      timeout: 5000
    });

    test.on('error', reject);
    test.on('response', resolve);
    test.end();
  });
}

// Main execution function
async function predict(imageUrl) {
  try {
    // Test connection first
    await testConnection();
    
    // Perform prediction
    const result = await testModel(imageUrl);
    // console.log('Prediction Results:', result);
    return result;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error(`Unable to connect to ${HOST}:${PORT}`);
      console.error('Please verify:');
      console.error('1. The server is running');
      console.error('2. The port number is correct');
      console.error('3. Any firewall rules allow this connection');
      console.error('4. The IP address is correct');
    }
    throw error;
  }
}

// Export the main function
module.exports = predict;