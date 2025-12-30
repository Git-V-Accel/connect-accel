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
    'application/x-zip-compressed',
    // Presentations
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    // Spreadsheets
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    // CSV
    'text/csv',
    'application/csv'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: Images (JPG, JPEG, PNG, GIF, WEBP), PDFs, Documents (DOC, DOCX, TXT, ZIP), Presentations (PPT, PPTX), Spreadsheets (XLS, XLSX), CSV`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 25MB max file size
  }
});

// Middleware for multiple files
const uploadFiles = (req, res, next) => {
  const handler = upload.fields([
    { name: 'files', maxCount: 50 },
    { name: 'attachments', maxCount: 50 },
  ]);

  handler(req, res, (err) => {
    if (err) return next(err);

    const files = [];
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else if (req.files && typeof req.files === 'object') {
      if (Array.isArray(req.files.files)) files.push(...req.files.files);
      if (Array.isArray(req.files.attachments)) files.push(...req.files.attachments);
    }
    req.files = files;

    next();
  });
};

// Middleware for single file
const uploadSingle = upload.single('file');

module.exports = {
  uploadFiles,
  uploadSingle,
  upload
};

