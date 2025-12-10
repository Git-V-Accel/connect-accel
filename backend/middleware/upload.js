const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = {
  images: path.join(__dirname, '../uploads/images'),
  pdfs: path.join(__dirname, '../uploads/pdfs'),
  documents: path.join(__dirname, '../uploads/documents')
};

// Create directories if they don't exist
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on file type
    const fileType = file.mimetype;
    
    if (fileType.startsWith('image/')) {
      cb(null, uploadDirs.images);
    } else if (fileType === 'application/pdf') {
      cb(null, uploadDirs.pdfs);
    } else {
      cb(null, uploadDirs.documents);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    // Sanitize filename
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // PDFs
    'application/pdf',
    // Documents
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: Images (JPG, PNG, GIF, WEBP), PDFs, Documents (DOC, DOCX, TXT, ZIP)`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB max file size
  }
});

// Middleware for multiple files
const uploadFiles = upload.array('files', 10); // Allow up to 10 files

// Middleware for single file
const uploadSingle = upload.single('file');

module.exports = {
  uploadFiles,
  uploadSingle,
  upload
};

