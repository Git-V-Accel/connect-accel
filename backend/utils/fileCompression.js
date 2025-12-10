const pako = require('pako');

/**
 * Decompress base64 data URL back to original file
 * @param {string} base64Url - Base64 data URL (compressed or uncompressed)
 * @returns {Object} - {data: Buffer, originalSize: number, isCompressed: boolean}
 */
const decompressBase64ToFile = (base64Url) => {
  try {
    // Check if it's a compressed data URL
    if (base64Url.startsWith('data:application/compressed;base64,')) {
      // Extract base64 data
      const base64Data = base64Url.split(',')[1];
      const binaryString = Buffer.from(base64Data, 'base64');
      const compressedData = new Uint8Array(binaryString);
      
      // Decompress using gzip
      const decompressed = pako.ungzip(compressedData);
      
      return {
        data: Buffer.from(decompressed),
        originalSize: decompressed.length,
        isCompressed: true,
      };
    } else {
      // Regular base64 data URL (uncompressed)
      const base64Data = base64Url.includes(',') ? base64Url.split(',')[1] : base64Url;
      const data = Buffer.from(base64Data, 'base64');
      
      return {
        data,
        originalSize: data.length,
        isCompressed: false,
      };
    }
  } catch (error) {
    console.error('Error decompressing file:', error);
    throw error;
  }
};

/**
 * Send decompressed file as response
 * @param {Object} res - Express response object
 * @param {string} base64Url - Base64 data URL
 * @param {string} fileName - File name
 * @param {string} mimeType - File MIME type
 */
const sendDecompressedFile = (res, base64Url, fileName, mimeType) => {
  try {
    const { data, originalSize } = decompressBase64ToFile(base64Url);
    
    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', originalSize);
    
    res.send(data);
  } catch (error) {
    console.error('Error sending decompressed file:', error);
    res.status(500).json({
      success: false,
      message: 'Error decompressing file',
    });
  }
};

module.exports = {
  decompressBase64ToFile,
  sendDecompressedFile,
};

