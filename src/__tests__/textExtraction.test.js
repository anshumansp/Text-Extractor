const { extractText, TextExtractionError } = require('../utils/textExtraction');
const path = require('path');

describe('Text Extraction', () => {
    const testImagePath = path.join(__dirname, '../__fixtures__/test-image.png');

    test('should extract text from valid image', async () => {
        const text = await extractText(testImagePath);
        expect(text).toBeTruthy();
        expect(typeof text).toBe('string');
    });

    test('should throw error for invalid image path', async () => {
        await expect(extractText('invalid/path')).rejects.toThrow(TextExtractionError);
    });
}); 