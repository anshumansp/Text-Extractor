// Import warning suppression
require("./suppressWarnings");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const { processImage } = require("./utils/imageProcessing");
const { extractText } = require("./utils/textExtraction");
const { processPDF } = require("./utils/pdfProcessing");
const { detectDiagrams } = require("./utils/diagramsDetection");
const ensureDirectories = require("./middleware/ensureDirectories");
const errorLogger = require("./middleware/errorLogger");
const {
  extractTextFromPDF,
  extractTextFromDocx,
  extractDataFromExcel,
} = require("./utils/documentProcessing");
const fs = require("fs");
const vision = require('@google-cloud/vision');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(ensureDirectories);

// Add this near the top of the file
const PROJECT_ROOT = path.resolve(__dirname, "..");

let fileCounter = 1;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(
      PROJECT_ROOT,
      process.env.UPLOAD_DIR || "uploads"
    );
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    const ext = path.extname(fileName);
    const basename = path.basename(fileName, ext);

    // Add counter only if file exists
    const finalName = `${basename}${ext}`;
    if (fs.existsSync(path.join(PROJECT_ROOT, "uploads", finalName))) {
      cb(null, `${basename}_${fileCounter++}${ext}`);
    } else {
      cb(null, finalName);
    }
  },
});

// Update fileFilter in multer configuration
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "image/jpeg",
    "image/png",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Supported types: PDF, DOCX, XLSX, XLS, JPG, PNG"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB default
  },
}).single("file"); // Explicitly configure for 'file' field

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal server error",
      code: err.code || "INTERNAL_ERROR",
    },
  });
};

// Add this utility function at the top of server.js
async function safeFileCleanup(filePath) {
  try {
    await fs.promises.access(filePath);
    await fs.promises.unlink(filePath);
    console.log(`Successfully cleaned up file: ${filePath}`);
  } catch (error) {
    if (error.code === "EPERM") {
      console.warn(`File is locked, will be cleaned up later: ${filePath}`);
      // Schedule cleanup for later
      setTimeout(async () => {
        try {
          await fs.promises.unlink(filePath);
          console.log(`Delayed cleanup successful: ${filePath}`);
        } catch (err) {
          console.error(`Failed delayed cleanup: ${filePath}`, err);
        }
      }, 1000); // Try again after 1 second
    } else {
      console.warn(`Failed to cleanup file: ${filePath}`, error);
    }
  }
}

// Configure Google Cloud Vision client with credentials
const client = new vision.ImageAnnotatorClient({
  keyFilename: './aarambh-cloud-vision.json'
});

// Add this new function for document text detection
async function recognizeDocumentText(imagePath) {
  try {
    const [result] = await client.documentTextDetection(imagePath);
    const detections = result.fullTextAnnotation;
    
    if (!detections) {
      throw new Error('No text detected in the image');
    }

    // Check confidence scores if available
    if (result.confidence && result.confidence < 0.6) {
      console.warn('Low confidence detection:', result.confidence);
    }

    return {
      text: detections.text,
      confidence: result.confidence || null
    };
  } catch (error) {
    console.error('Error in text recognition:', error);
    throw error;
  }
}

// Unified test endpoint for all file types
app.post(
  "/api/process",
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res.status(400).json({
          error: {
            message: err.message,
            code: err.code,
            field: err.field,
          },
        });
      } else if (err) {
        // An unknown error occurred when uploading
        return res.status(500).json({
          error: {
            message: err.message,
            code: "UPLOAD_ERROR",
          },
        });
      }
      // Everything went fine, proceed with processing
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const imagePath = req.file.path;
      
      // Replace Tesseract processing with Google Cloud Vision
      const result = await recognizeDocumentText(imagePath);

      // Clean up the temporary file after processing
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });
      console.log(result)
      return res.json({
        success: true,
        data: {
          text: result.text,
          confidence: result.confidence
        }
      });

    } catch (error) {
      console.error('Error processing image:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to process image',
        details: error.message
      });
    }
  }
);

// Health check endpoint
app.get("/health", (req, res) => {
  console.log("Requested Health Check")

  console.log("Health Check Successful");

  res.json({ status: "ok" });
});

app.use(errorLogger);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});