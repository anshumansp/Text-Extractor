const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const PROJECT_ROOT = path.resolve(__dirname, '../..');

class ImageProcessingError extends Error {
    constructor(message, code = 'IMAGE_PROCESSING_ERROR') {
        super(message);
        this.code = code;
    }
}

async function processImage(filePath) {
    try {
        console.log('Processing image:', filePath);

        const tempDir = path.join(PROJECT_ROOT, process.env.TEMP_DIR || 'temp');
        const outputPath = path.join(
            tempDir,
            `processed-${Date.now()}.png`
        );

        // Enhanced image processing for better OCR results
        await sharp(filePath)
            .grayscale() // Convert to grayscale
            .normalize() // Normalize the image
            .sharpen() // Apply sharpening
            .threshold(128) // Apply thresholding for better text contrast
            .resize(2000, 2000, { // Resize while maintaining aspect ratio
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFile(outputPath);

        console.log('Image processed successfully:', outputPath);
        return outputPath;
    } catch (error) {
        console.error('Image processing error:', error);
        throw new ImageProcessingError(
            `Failed to process image: ${error.message}`
        );
    }
}

module.exports = { processImage, ImageProcessingError };