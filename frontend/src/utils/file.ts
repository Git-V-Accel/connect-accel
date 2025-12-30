// Reusable file utilities

import { FileArchive, FileImage, FileSpreadsheet, FileText } from "lucide-react";

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  const fractionDigits = i === 0 ? 0 : 2;
  return `${val.toFixed(fractionDigits)} ${units[i]}`;
}

export function openFileInNewTab(file: File): void {
  try {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    // Revoke after a short delay to allow the new tab to load
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e) {
    // Swallow error here; caller should handle UI notifications if needed
    // console.error("Failed to open file", e);
  }
}

export const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return { Icon: FileText, color: 'text-red-600', bg: 'bg-red-50' };
      case 'jpg':
      case 'jpeg':
      case 'png':
        return { Icon: FileImage, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'zip':
        return { Icon: FileArchive, color: 'text-amber-600', bg: 'bg-amber-50' };
      case 'doc':
      case 'docx':
        return { Icon: FileText, color: 'text-blue-700', bg: 'bg-blue-50' };
      case 'ppt':
      case 'pptx':
        return { Icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' };
      case 'xls':
      case 'xlsx':
      case 'csv':
        return { Icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50' };
      case 'txt':
        return { Icon: FileText, color: 'text-gray-700', bg: 'bg-gray-100' };
      default:
        return { Icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };