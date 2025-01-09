const Tesseract = require('tesseract.js');
const path = require('path');

class TextExtractionError extends Error {
    constructor(message, code = 'TEXT_EXTRACTION_ERROR') {
        super(message);
        this.code = code;
    }
}

async function extractText(imagePath) {
    try {
        console.log('Starting OCR process for:', imagePath);

        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'eng',
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${(m.progress * 100).toFixed(2)}%`);
                    }
                }
            }
        );

        if (!text || !text.trim()) {
            throw new TextExtractionError('No text could be extracted from the image');
        }

        console.log('OCR completed successfully');
        return text.trim();
    } catch (error) {
        console.error('OCR Error:', error);
        if (error instanceof TextExtractionError) {
            throw error;
        }
        throw new TextExtractionError(
            `Failed to extract text from image: ${error.message}`
        );
    }
}

module.exports = { extractText, TextExtractionError };