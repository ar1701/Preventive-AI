### Deployed Link: https://genai-ai-cancer-detection.onrender.com
#### Note:-
This website is deployed on a free service called (Render.com). So It might take 40-50 sec to open for the first time in your pc, but once it opened it will be much faster.

# AI-Powered Cancer Detection Solution

Welcome to the **AI-Powered Cancer Detection Solution** repository! This project aims to revolutionize the early detection of cancer by using cutting-edge technologies like artificial intelligence (AI), cloud storage, OCR (Optical Character Recognition), and document processing tools. Our solution allows users to upload medical images, PDF reports, or text files, which are then analyzed by our AI model to detect early signs of cancer, thus improving patient outcomes and healthcare efficiency.

## Purpose

The purpose of this project is to provide healthcare professionals with an efficient, accurate, and user-friendly tool to detect cancer at its early stages. By leveraging advanced machine learning models and powerful APIs, the solution enables quick analysis of patient reports (images, PDFs, or text) and provides timely alerts to healthcare providers for further investigation and treatment planning.

## Project Features

- **Upload and Analyze Medical Reports**: Users can upload images, PDF files, or text-based reports for AI-powered analysis.
- **AI-Based Detection**: Our machine learning model scans and analyzes the uploaded reports to detect early cancer symptoms.
- **Real-Time OCR Processing**: For scanned documents or PDFs, the Groq API extracts text, enabling accurate data retrieval.
- **PDF to Image Conversion**: The Pdf.co API is used to convert PDF reports into images for further analysis by the AI model.
- **Cloud Storage**: Images and reports are stored securely on the Cloudinary platform for easy access and retrieval.

## Technologies Used

### Frontend:
- **HTML/CSS/JavaScript**: The website interface is built using basic HTML, CSS, and JavaScript for user interaction and file uploads.

### Backend:
- **Cloudinary API**: Used for securely storing uploaded images and PDF reports in the cloud.
- **Pdf.co API**: Converts PDF reports into images to enable further analysis by the AI model.
- **Groq API**: Provides Optical Character Recognition (OCR) for extracting text from images or scanned documents, allowing deeper insights into the medical reports.
- **Our AI Model**: A custom machine learning model trained to detect early cancer stages by analyzing medical images and text data.
  
## How It Works

1. **Upload**: Users can upload either an image, PDF, or text report through the website.
2. **OCR Processing**: If the uploaded document is a scanned image or PDF, the Groq API performs OCR to extract text data.
3. **Conversion**: The Pdf.co API converts PDF reports into images for further AI analysis.
4. **Analysis**: Our AI model analyzes the uploaded images or extracted data to identify potential cancer risks.
5. **Results**: Users receive a report detailing the analysis results, highlighting any high-risk indicators or next steps.

## APIs & External Services

- **Cloudinary API**: Stores the images and PDFs in the cloud.
- **Pdf.co API**: Converts PDFs into images for enhanced analysis by our AI model.
- **Groq API**: Performs OCR on images to extract important information from scanned documents.
- **AI Model**: A machine learning model designed to detect signs of cancer from medical reports.

## Installation and Setup

To run this project locally, follow the steps below:

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/ai-cancer-detection.git
    cd ai-cancer-detection
    ```

2. Install the required dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables for the Cloudinary API, Pdf.co API, and Groq API:
    ```bash
    CLOUDINARY_API_KEY=your_cloudinary_key
    CLOUDINARY_API_SECRET=your_cloudinary_secret
    GROQ_API_KEY=your_groq_key
    PDF_API_KEY=your_pdfco_key
    ```

4. Run the development server:
    ```bash
    node app.js
    ```

## Usage

1. Navigate to the main page.
2. Choose a file type (image, PDF, or text).
3. Upload the medical report, and the system will analyze it.
4. Receive detailed analysis on the uploaded file.

## Future Enhancements

- **Enhanced AI Model**: Training the AI model on a broader dataset for even higher accuracy.
- **Multilingual Support**: Expanding OCR capabilities to support multiple languages for international users.
- **Mobile App**: Developing a mobile application to enable report uploads directly from smartphones.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Join us in our mission to improve early cancer detection and save lives!**

