import React from 'react';
import { Button } from '../ui/button';
import { Upload, X, Paperclip } from 'lucide-react';
import { API_CONFIG } from '../../config/api';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
  existingAttachments?: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
  onRemoveExistingAttachment?: (index: number) => void;
}

export default function FileUpload({
  files,
  onFilesChange,
  onRemoveFile,
  accept = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif",
  maxFiles = 10,
  maxSize = 10,
  disabled = false,
  className = "",
  label = "Attachments",
  description = "Add any relevant documents, portfolio samples, or supporting materials (optional)",
  existingAttachments = [],
  onRemoveExistingAttachment
}: FileUploadProps) {
  // Helper function to construct full URL for attachments
  const getFullAttachmentUrl = (url: string) => {
    if (!url) return '';
    // If URL is already absolute, return as is
    if (url.startsWith('http')) return url;
    // Remove /api from base URL for uploads since they're served at root level
    const baseUrl = API_CONFIG.API_URL.replace('/api', '');
    const fullUrl = `${baseUrl}${url}`;
    console.log('Attachment URL:', { original: url, baseUrl, full: fullUrl });
    return fullUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file count
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    // Validate file sizes
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Files must be smaller than ${maxSize}MB`);
      return;
    }
    
    onFilesChange([...files, ...selectedFiles]);
    // Clear the input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    // Validate file count
    if (files.length + droppedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    // Validate file sizes
    const oversizedFiles = droppedFiles.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Files must be smaller than ${maxSize}MB`);
      return;
    }
    
    onFilesChange([...files, ...droppedFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="text-gray-900 font-medium">{label}</label>
        <p className="text-xs text-gray-500 mt-1 mb-3">{description}</p>
      </div>
      
      {/* File Upload Area */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept={accept}
          disabled={disabled}
        />
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className="size-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {accept.replace(/\./g, '').toUpperCase()} (max {maxSize}MB each)
          </p>
        </label>
      </div>

      {/* Existing Attachments */}
      {existingAttachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Existing attachments:</p>
          {existingAttachments.map((attachment, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <Paperclip className="size-4 text-blue-500" />
              <div className="flex-1">
                <a
                  href={getFullAttachmentUrl(attachment.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate block whitespace-normal"
                >
                  {attachment.name}
                </a>
                <p className="text-xs text-gray-500">
                  {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Existing file'}
                </p>
              </div>
              {onRemoveExistingAttachment && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveExistingAttachment(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={disabled}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Files to be uploaded:</p>
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <Paperclip className="size-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={disabled}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
