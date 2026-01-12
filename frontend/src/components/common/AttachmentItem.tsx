import React from 'react';
import { Button } from '../ui/button';
import { ExternalLink, Download } from 'lucide-react';
import { formatFileSize, getFileIcon } from '../../utils/file';
import API_CONFIG from '../../config/api';

interface AttachmentItemProps {
  attachment: {
    name?: string;
    originalName?: string;
    fileName?: string;
    url?: string;
    fileUrl?: string;
    size?: number;
    fileSize?: number;
    compressedSize?: number;
  };
  showDownload?: boolean;
  className?: string;
}

export default function AttachmentItem({
  attachment,
  showDownload = true,
  className = '',
}: AttachmentItemProps) {
  const { Icon, color, bg } = getFileIcon(attachment.name || attachment.originalName || attachment.fileName || 'file');
  const url = `${API_CONFIG.API_URL.replace('/api', '')}${attachment.url || attachment.fileUrl || ''}`;
  const size = attachment.size ?? attachment.fileSize ?? attachment.compressedSize ?? 0;

  const openInNewTab = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openInNewTab();
    }
  };

  return (
    <div className={`flex items-center justify-between p-2 bg-white border rounded-md ${className}`}>
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={openInNewTab}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        title="Open in new tab"
      >
        <div className={`p-2 ${bg} rounded`}>
          <Icon className={`size-4 ${color}`} />
        </div>
        <div>
          <p className="text-sm font-medium truncate max-w-[240px] group-hover:underline" title={attachment.name || attachment.originalName || attachment.fileName || 'Attachment'}>
            {attachment.name || attachment.originalName || attachment.fileName || 'Attachment'}
          </p>
          <p className="text-xs text-gray-500">{formatFileSize(size)}</p>
        </div>
      </div>
      {showDownload && (
        <Button variant="secondary" size="sm" asChild>
          <a href={url} target="_blank" download>
            <Download className="size-4 mr-2" /> Download
          </a>
        </Button>
      )}
    </div>
  );
}
