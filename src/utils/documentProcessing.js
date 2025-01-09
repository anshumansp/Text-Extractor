const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');

class DocumentProcessingError extends Error {
    constructor(message, code = 'DOCUMENT_PROCESSING_ERROR') {
        super(message);
        this.code = code;
    }
}

async function extractTextFromPDF(filePath) {
    try {
        console.log('Processing PDF:', filePath);
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        
        if (!data.text || !data.text.trim()) {
            throw new DocumentProcessingError('No text found in PDF');
        }
        
        return data.text.trim();
    } catch (error) {
        throw new DocumentProcessingError(
            `Failed to extract text from PDF: ${error.message}`
        );
    }
}

async function extractTextFromDocx(filePath) {
    try {
        console.log('Processing DOCX:', filePath);
        const result = await mammoth.extractRawText({ path: filePath });
        
        if (!result.value || !result.value.trim()) {
            throw new DocumentProcessingError('No text found in document');
        }
        
        return result.value.trim();
    } catch (error) {
        throw new DocumentProcessingError(
            `Failed to extract text from DOCX: ${error.message}`
        );
    }
}

async function extractDataFromExcel(filePath) {
    try {
        console.log('Processing Excel:', filePath);
        const workbook = xlsx.readFile(filePath);
        const result = {};
        
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            result[sheetName] = xlsx.utils.sheet_to_json(worksheet);
        });
        
        if (Object.keys(result).length === 0) {
            throw new DocumentProcessingError('No data found in Excel file');
        }
        
        return result;
    } catch (error) {
        throw new DocumentProcessingError(
            `Failed to extract data from Excel: ${error.message}`
        );
    }
}

module.exports = {
    extractTextFromPDF,
    extractTextFromDocx,
    extractDataFromExcel,
    DocumentProcessingError
};