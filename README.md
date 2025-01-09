# Text Extractor

A modern web application that extracts text from images using Google Cloud Vision API. This project provides a clean UI for uploading images and displays the extracted text in real-time.

## Features

- 📷 Image text extraction using Google Cloud Vision API
- 🎯 High accuracy text detection and recognition
- 💻 Clean and modern user interface
- ⚡ Real-time text extraction and display
- 🔒 Secure file handling and processing
- 🚀 Easy to set up and use

## Live Demo

Try out the application: [Text Extractor Demo](https://github.com/anshumansp/Text-Extractor)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (Node Package Manager)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/anshumansp/Text-Extractor.git
cd Text-Extractor
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./cloud-vision.json
```

## Google Cloud Vision API Setup

1. Create a Google Cloud Project:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable billing for the project

2. Enable the Cloud Vision API:
   - In the Cloud Console, go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

3. Create Service Account Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the service account details
   - Grant the role "Cloud Vision API User"
   - Click "Create Key" and select JSON
   - Download the JSON key file

4. Setup Credentials:
   - Rename the downloaded JSON key file to `cloud-vision.json`
   - Place it in the root directory of the project
   - Add the file path to your .env file:
     ```env
     GOOGLE_APPLICATION_CREDENTIALS=./cloud-vision.json
     ```

## Project Structure

```
Text-Extractor/
├── src/
│   ├── server.js           # Main server file
│   ├── test.html          # Frontend UI
│   ├── suppressWarnings.js # Warning suppression utility
│   ├── middleware/
│   │   ├── errorLogger.js      # Error logging middleware
│   │   └── ensureDirectories.js # Directory creation middleware
│   └── utils/             # Utility functions
├── uploads/              # Temporary file storage
├── .env                 # Environment variables
└── README.md            # Project documentation
```

## Implementation Details

### Server Implementation (server.js)

The server is built using Express.js and handles file uploads and text extraction:

```javascript
const express = require("express");
const vision = require('@google-cloud/vision');

// Configure Google Cloud Vision client
const client = new vision.ImageAnnotatorClient({
  keyFilename: './cloud-vision.json'
});

// Text recognition function
async function recognizeDocumentText(imagePath) {
  const [result] = await client.documentTextDetection(imagePath);
  return {
    text: result.fullTextAnnotation.text,
    confidence: result.confidence || null
  };
}
```

### API Endpoints

#### 1. Process Image
- **URL**: `/api/process`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  ```
  file: <image_file>
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "text": "extracted text content",
      "confidence": 0.95
    }
  }
  ```

#### 2. Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "ok"
  }
  ```

## Running the Application

1. Start the server:
```bash
npm start
```

2. Open `src/test.html` in a web browser or serve it using a static file server.

3. The application will be available at:
- Frontend: `http://localhost:3000/test.html`
- API: `http://localhost:3000/api/process`

## Error Handling

The application includes comprehensive error handling:
- File upload validation
- Image processing errors
- API response validation
- Server-side logging

## Security Considerations

1. File Upload Security:
   - File type validation
   - File size limits
   - Secure file naming
   - Automatic cleanup

2. API Security:
   - CORS configuration
   - Error logging
   - Rate limiting (configurable)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Cloud Vision API for text extraction
- Express.js for the server framework
- Multer for file upload handling

## Support

For support, email your queries to [contact@pixelizesolution.com] or open an issue in the GitHub repository. 