const fs = require('fs');
const path = require('path');
const { decompressBase64ToFile } = require('./fileCompression');

const UPLOAD_BASE_PATH = path.join(__dirname, '../uploads');
const BACKEND_ROOT = path.join(__dirname, '..');

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const sanitizeName = (name) => {
  if (!name) return 'file';
  return name.replace(/[^a-zA-Z0-9-_]/g, '_') || 'file';
};

const getUploadSubfolder = (mimeType = '') => {
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType === 'application/pdf') return 'pdfs';
  return 'documents';
};

const getFileExtension = (originalName = '', mimeType = '') => {
  const extFromName = path.extname(originalName || '').toLowerCase();
  if (extFromName) return extFromName;

  const mimeMap = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/zip': '.zip',
    'application/x-zip-compressed': '.zip',
  };

  if (mimeType && mimeMap[mimeType]) {
    return mimeMap[mimeType];
  }
  return '';
};

const writeBufferToUploads = (buffer, originalName, mimeType) => {
  const subfolder = getUploadSubfolder(mimeType);
  const dirPath = path.join(UPLOAD_BASE_PATH, subfolder);
  ensureDirectoryExists(dirPath);

  const extension = getFileExtension(originalName, mimeType);
  const baseName = sanitizeName(
    extension
      ? originalName?.slice(0, -extension.length)
      : originalName || 'file'
  );
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${baseName}-${uniqueSuffix}${extension}`;
  const filePath = path.join(dirPath, filename);

  fs.writeFileSync(filePath, buffer);

  return {
    relativeUrl: `/uploads/${subfolder}/${filename}`,
    absolutePath: filePath,
    size: buffer.length,
    filename,
  };
};

const formatUploadedFile = (file) => {
  if (!file) return null;

  let relativeUrl = '';
  if (file.path) {
    relativeUrl = file.path.replace(BACKEND_ROOT, '').replace(/\\/g, '/');
    if (!relativeUrl.startsWith('/')) {
      relativeUrl = `/${relativeUrl}`;
    }
  } else {
    relativeUrl = `/uploads/${getUploadSubfolder(file.mimetype)}/${file.filename}`;
  }

  if (!relativeUrl.startsWith('/uploads')) {
    relativeUrl = relativeUrl.replace('/uploads', '');
    relativeUrl = `/uploads${relativeUrl}`;
  }

  return {
    id: Date.now() + Math.random(),
    name: file.filename,
    originalName: file.originalname,
    size: file.size,
    compressedSize: file.size,
    type: file.mimetype || 'application/octet-stream',
    url: relativeUrl,
    path: file.path,
    isCompressed: false,
    uploadedAt: new Date(),
  };
};

const convertBase64Attachments = (attachmentsInput) => {
  if (!attachmentsInput) return [];

  let attachmentsArray = [];
  if (typeof attachmentsInput === 'string') {
    try {
      attachmentsArray = JSON.parse(attachmentsInput);
    } catch (err) {
      attachmentsArray = [];
    }
  } else if (Array.isArray(attachmentsInput)) {
    attachmentsArray = attachmentsInput;
  }

  const savedAttachments = [];

  attachmentsArray.forEach((attachment) => {
    if (!attachment || typeof attachment !== 'object') return;
    const url = attachment.url || attachment.base64 || attachment.data;
    if (!url || typeof url !== 'string' || !url.startsWith('data:')) return;

    try {
      const { data, originalSize, isCompressed } = decompressBase64ToFile(url);
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const meta = writeBufferToUploads(
        buffer,
        attachment.originalName || attachment.name || 'file',
        attachment.type || attachment.mimeType || 'application/octet-stream'
      );

      savedAttachments.push({
        id: Date.now() + Math.random(),
        name: meta.filename,
        originalName: attachment.originalName || attachment.name || meta.filename,
        size: originalSize || buffer.length,
        compressedSize: meta.size,
        type: attachment.type || attachment.mimeType || 'application/octet-stream',
        url: meta.relativeUrl,
        path: meta.absolutePath,
        isCompressed: isCompressed || false,
        uploadedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to convert base64 attachment:', error);
    }
  });

  return savedAttachments;
};

const normalizeAttachmentForStorage = (attachment = {}) => {
  if (!attachment || typeof attachment !== 'object') return null;

  const baseName =
    attachment.originalName ||
    attachment.name ||
    attachment.fileName ||
    attachment.filename ||
    'attachment';

  const size =
    attachment.size ||
    attachment.fileSize ||
    attachment.compressedSize ||
    attachment.bytes ||
    attachment.metadata?.size ||
    attachment.metadata?.originalSize ||
    0;

  const url =
    attachment.url ||
    attachment.fileUrl ||
    attachment.path ||
    attachment.relativeUrl ||
    '';

  const type =
    attachment.type ||
    attachment.fileType ||
    attachment.mimeType ||
    attachment.metadata?.type ||
    'application/octet-stream';

  return {
    id: attachment.id || attachment._id || Date.now() + Math.random(),
    name: attachment.name || baseName,
    originalName: attachment.originalName || baseName,
    fileName: attachment.fileName || attachment.name || baseName,
    url,
    fileUrl: attachment.fileUrl || url,
    path: attachment.path,
    size,
    fileSize: attachment.fileSize || size,
    compressedSize: attachment.compressedSize || attachment.size || size,
    type,
    fileType: attachment.fileType || type,
    isCompressed: attachment.isCompressed ?? false,
    uploadedAt: attachment.uploadedAt || new Date(),
  };
};

const processAttachments = (files = [], attachmentsInput = null) => {
  const uploadedFiles = Array.isArray(files)
    ? files.map((file) => formatUploadedFile(file)).filter(Boolean)
    : [];

  const base64Attachments = convertBase64Attachments(attachmentsInput);

  let sanitizedAttachments = [];
  if (Array.isArray(attachmentsInput)) {
    sanitizedAttachments = attachmentsInput
      .filter(
        (attachment) =>
          attachment &&
          typeof attachment === 'object' &&
          !(
            typeof attachment.url === 'string' &&
            attachment.url.startsWith('data:')
          )
      )
      .map((attachment) => ({
        ...attachment,
        uploadedAt: attachment.uploadedAt || new Date(),
      }));
  }

  return [...uploadedFiles, ...base64Attachments, ...sanitizedAttachments]
    .map(normalizeAttachmentForStorage)
    .filter(Boolean);
};

module.exports = {
  formatUploadedFile,
  convertBase64Attachments,
  processAttachments,
  normalizeAttachmentForStorage,
};

