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
        'prose prose-sm max-w-full',
        'w-full break-words overflow-wrap-anywhere',
        'prose-headings:font-semibold prose-headings:break-words',
        'prose-p:my-2 prose-p:break-words',
        'prose-ul:my-2 prose-ol:my-2',
        'prose-li:my-1 prose-li:break-words',
        'prose-a:text-blue-600 prose-a:underline prose-a:break-words',
        'prose-strong:font-semibold prose-strong:break-words',
        'prose-em:italic prose-em:break-words',
        'prose-pre:break-words prose-pre:whitespace-pre-wrap prose-pre:max-w-full',
        'prose-code:break-words',
        className
      )}
      style={{ 
        maxWidth: 'min(100%, 100ch)',
        wordWrap: 'break-word', 
        overflowWrap: 'anywhere',
        width: '100%'
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

