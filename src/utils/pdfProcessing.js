const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const { processImage } = require('./imageProcessing');
const { extractText } = require('./textExtraction');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

class PDFProcessingError extends Error {
    constructor(message, code = 'PDF_PROCESSING_ERROR') {
        super(message);
        this.code = code;
    }
}

async function processPDF(filePath) {
    try {
        // Convert to absolute path if it's relative
        const absoluteFilePath = path.isAbsolute(filePath) 
            ? filePath 
            : path.join(PROJECT_ROOT, filePath);

        // Ensure file exists
        try {
            await fs.access(absoluteFilePath);
        } catch (error) {
            throw new PDFProcessingError(`File not found: ${absoluteFilePath}`);
        }

        const pdfBytes = await fs.readFile(absoluteFilePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        let allText = '';

        const tempDir = path.join(PROJECT_ROOT, process.env.TEMP_DIR || 'temp');
        
        // Ensure temp directory exists
        if (!fs.existsSync(tempDir)) {
            await fs.mkdir(tempDir, { recursive: true });
        }

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width, height } = page.getSize();
            
            // Convert page to PNG
            const pngBytes = await page.exportAsPNG({
                width,
                height
            });

            const tempImagePath = path.join(tempDir, `page-${i + 1}.png`);
            
            await fs.writeFile(tempImagePath, pngBytes);
            const processedImage = await processImage(tempImagePath);
            const pageText = await extractText(processedImage);
            allText += pageText + '\n\n';
            
            // Cleanup temporary files
            try {
                await fs.unlink(tempImagePath);
                await fs.unlink(processedImage);
            } catch (error) {
                console.warn('Failed to cleanup temporary files:', error);
            }
        }

        return { text: allText.trim() };
    } catch (error) {
        if (error instanceof PDFProcessingError) {
            throw error;
        }
        throw new PDFProcessingError(
            `Failed to process PDF: ${error.message}`
        );
    }
}

module.exports = { processPDF, PDFProcessingError }; 