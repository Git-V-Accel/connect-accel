import React from 'react';
import { cn } from '../ui/utils';

export interface RichTextViewerProps {
  content: string;
  className?: string;
}

export function RichTextViewer({ content, className }: RichTextViewerProps) {
  if (!content) {
    return (
      <div className={cn('text-gray-500 italic', className)}>
        No content available
      </div>
    );
  }

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:font-semibold',
        'prose-p:my-2',
        'prose-ul:my-2 prose-ol:my-2',
        'prose-li:my-1',
        'prose-a:text-blue-600 prose-a:underline',
        'prose-strong:font-semibold',
        'prose-em:italic',
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

