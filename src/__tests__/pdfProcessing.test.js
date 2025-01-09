const { processPDF, PDFProcessingError } = require('../utils/pdfProcessing');
const path = require('path');

describe('PDF Processing', () => {
    const testPDFPath = path.join(__dirname, '../__fixtures__/test-document.pdf');

    test('should process PDF successfully', async () => {
        const result = await processPDF(testPDFPath);
        expect(result).toHaveProperty('text');
        expect(typeof result.text).toBe('string');
    });

    test('should throw error for invalid PDF', async () => {
        await expect(processPDF('invalid/path')).rejects.toThrow(PDFProcessingError);
    });
}); 