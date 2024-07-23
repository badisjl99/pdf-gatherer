const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'putin.pdf';

const readPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  
  try {
    const data = await pdf(dataBuffer);
    console.log(data.text);
    
    // Optionally, write the extracted text to a file
    fs.writeFileSync('extracted_text.txt', data.text, 'utf-8');
    console.log('Text extracted and saved to extracted_text.txt');
  } catch (error) {
    console.error('Error reading PDF:', error);
  }
};

readPDF(pdfPath);
