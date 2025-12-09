import React, { useRef, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo
} from 'lucide-react';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  disabled?: boolean;
}

export const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  (
    {
      value = '',
      onChange,
      placeholder = 'Start typing...',
      className,
      minHeight = '200px',
      maxHeight,
      disabled = false
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Sync external value with editor (avoid overwriting while focused)
    useEffect(() => {
      if (editorRef.current && value !== editorRef.current.innerHTML && !isFocused) {
        editorRef.current.innerHTML = value;
      }
    }, [value, isFocused]);

    const handleInput = () => {
      if (editorRef.current && onChange) {
        onChange(editorRef.current.innerHTML);
      }
    };

    // Paste as plain text to avoid weird markup
    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      // insertText execCommand is widely supported; fallback to insertHTML if needed
      try {
        document.execCommand('insertText', false, text);
      } catch {
        document.execCommand('insertHTML', false, text.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      }
      handleInput();
    };

    const execCommand = (command: string, value?: string) => {
      if (disabled) return;
      const editor = editorRef.current;
      if (!editor) return;

      // ensure focus
      editor.focus();

      // For headings some browsers expect "<h1>" etc.
      const commandValue = command === 'formatBlock' && value ? `<${value}>` : value;

      // Try standard execCommand
      try {
        // Some browsers require a selection to exist — ensure there's at least a caret inside editor
        const sel = typeof window !== 'undefined' ? window.getSelection() : null;
        if (sel && sel.rangeCount === 0) {
          const range = document.createRange();
          if (editor.childNodes.length > 0) {
            range.setStart(editor, 0);
            range.collapse(true);
          } else {
            // create an empty paragraph so caret can be placed
            const p = document.createElement('p');
            p.innerHTML = '&nbsp;';
            editor.appendChild(p);
            range.setStart(p, 0);
            range.collapse(true);
          }
          sel.removeAllRanges();
          sel.addRange(range);
        }

        const ok = document.execCommand(command, false, commandValue as any);
        if (!ok && command === 'formatBlock' && value) {
          // fallback manual wrapping if execCommand failed
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);

            // if collapsed, create heading and put caret inside
            if (range.collapsed) {
              const heading = document.createElement(value);
              heading.innerHTML = '&nbsp;';
              range.insertNode(heading);

              const newRange = document.createRange();
              newRange.selectNodeContents(heading);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            } else {
              // wrap selected contents
              const wrapper = document.createElement(value);
              wrapper.appendChild(range.extractContents());
              range.insertNode(wrapper);

              const newRange = document.createRange();
              newRange.selectNodeContents(wrapper);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
        }
      } catch (err) {
        console.error('execCommand error:', err);
      }

      editor.focus();
      handleInput();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'b') {
          e.preventDefault();
          execCommand('bold');
        } else if (key === 'i') {
          e.preventDefault();
          execCommand('italic');
        } else if (key === 'u') {
          e.preventDefault();
          execCommand('underline');
        } else if (key === 'z' && !e.shiftKey) {
          e.preventDefault();
          execCommand('undo');
        } else if ((key === 'z' && e.shiftKey) || (key === 'y' && !e.shiftKey)) {
          e.preventDefault();
          execCommand('redo');
        }
      }
    };

    type ToolbarButton =
      | { separator: true }
      | {
          icon: React.ComponentType<{ className?: string }>;
          command: string;
          title: string;
          value?: string;
          requiresInput?: boolean;
        };

    const toolbarButtons: ToolbarButton[] = [
      { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
      { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
      { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
      { separator: true },
      { icon: Heading1, command: 'formatBlock', value: 'h1', title: 'Heading 1' },
      { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading 2' },
      { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Heading 3' },
      { separator: true },
      { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
      { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
      { separator: true },
      { icon: Undo, command: 'undo', title: 'Undo (Ctrl+Z)' },
      { icon: Redo, command: 'redo', title: 'Redo (Ctrl+Shift+Z)' }
    ];

    const handleToolbarClick = (button: ToolbarButton) => {
      if ('separator' in button) return;
      if (button.requiresInput) {
        const url = prompt('Enter URL:');
        if (url) execCommand(button.command, url);
      } else if (button.value) {
        execCommand(button.command, button.value);
      } else {
        execCommand(button.command);
      }
    };

    const isCommandActive = (command: string, value?: string) => {
      if (typeof window === 'undefined') return false;
      try {
        if (command === 'formatBlock' && value) {
          const currentValue = (document.queryCommandValue && document.queryCommandValue('formatBlock')) || '';
          // normalize: might return "<h1>" or "h1"
          const norm = currentValue.toString().replace(/<\/?|\s|>/g, '').toLowerCase();
          return norm === value.toLowerCase();
        }
        // queryCommandState returns boolean for many commands
        if (document.queryCommandState) {
          return !!document.queryCommandState(command);
        }
        return false;
      } catch {
        return false;
      }
    };

    return (
      <div className={cn('border border-gray-300 rounded-lg overflow-hidden', className)}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
          {toolbarButtons.map((button, index) => {
            if ('separator' in button) {
              return <div key={`sep-${index}`} className="w-px h-6 bg-gray-300 mx-1" />;
            }
            const Icon = button.icon;
            const active = isCommandActive(button.command, button.value);
            return (
              <Button
                key={index}
                type="button"
                variant="ghost"
                size="sm"
                className={cn('h-8 w-8 p-0', active && 'bg-gray-200')}
                onClick={() => handleToolbarClick(button)}
                title={button.title}
                disabled={disabled}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onPaste={handlePaste}
          className={cn(
            'w-full px-4 py-3 outline-none',
            'prose prose-sm max-w-none',
            'focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
            !value && !isFocused && 'text-gray-400',
            disabled && 'bg-gray-50 cursor-not-allowed'
          )}
          style={{ minHeight, maxHeight, overflowY: maxHeight ? 'auto' : 'visible' }}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />

        {/* Placeholder and heading styles + list alignment */}
        <style>{`
          [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }

          /* headings */
          [contenteditable] h1 {
            font-size: 2em;
            font-weight: 700;
            margin: 0.67em 0;
            line-height: 1.2;
            display: block;
          }
          [contenteditable] h2 {
            font-size: 1.5em;
            font-weight: 700;
            margin: 0.75em 0;
            line-height: 1.3;
            display: block;
          }
          [contenteditable] h3 {
            font-size: 1.17em;
            font-weight: 700;
            margin: 0.83em 0;
            line-height: 1.4;
            display: block;
          }

          /* Lists alignment & spacing */
          [contenteditable] ul, [contenteditable] ol {
            padding-left: 1.25rem; /* ensure indentation */
            margin: 0.5rem 0;
            list-style-position: outside;
          }
          [contenteditable] li {
            margin: 0.25rem 0;
          }

          /* Ensure paragraphs have some spacing */
          [contenteditable] p {
            margin: 0.5rem 0;
          }

          /* Make sure editor respects default list markers */
          [contenteditable] ul { list-style-type: disc; }
          [contenteditable] ol { list-style-type: decimal; }
        `}</style>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
