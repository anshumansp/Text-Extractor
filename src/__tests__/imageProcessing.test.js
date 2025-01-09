const { processImage, ImageProcessingError } = require('../utils/imageProcessing');
const path = require('path');
const fs = require('fs').promises;

describe('Image Processing', () => {
    const testImagePath = path.join(__dirname, '../__fixtures__/test-image.png');

    test('should process image successfully', async () => {
        const processedPath = await processImage(testImagePath);
        expect(processedPath).toBeTruthy();
        
        const stats = await fs.stat(processedPath);
        expect(stats.isFile()).toBe(true);
        
        // Cleanup
        await fs.unlink(processedPath);
    });

    test('should throw error for invalid image', async () => {
        await expect(processImage('invalid/path')).rejects.toThrow(ImageProcessingError);
    });
}); 