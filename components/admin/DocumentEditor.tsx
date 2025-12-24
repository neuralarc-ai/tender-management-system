'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  RiSaveLine, 
  RiCloseLine, 
  RiBold, 
  RiItalic, 
  RiUnderline,
  RiListOrdered,
  RiListUnordered,
  RiAlignLeft,
  RiAlignCenter,
  RiAlignRight,
  RiFormatClear,
  RiH1,
  RiH2,
  RiH3,
  RiTextWrap,
  RiFileCopyLine,
  RiRefreshLine
} from 'react-icons/ri';

interface DocumentEditorProps {
  documentId: string;
  initialContent: string;
  title: string;
  onSave: (content: string) => Promise<void>;
  onClose: () => void;
}

export function DocumentEditor({ 
  documentId, 
  initialContent, 
  title, 
  onSave, 
  onClose 
}: DocumentEditorProps): JSX.Element {
  const [content, setContent] = useState<string>(initialContent);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);
  const [selectedText, setSelectedText] = useState<string>('');

  useEffect(() => {
    // Calculate word count
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  useEffect(() => {
    // Check if content has changed
    setHasChanges(content !== initialContent);
  }, [content, initialContent]);

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    try {
      await onSave(content);
      setHasChanges(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = (): void => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }
    onClose();
  };

  const insertText = (before: string, after: string = ''): void => {
    const textarea = document.getElementById('document-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      before + 
      selectedText + 
      after + 
      content.substring(end);
    
    setContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length, 
        end + before.length
      );
    }, 0);
  };

  const insertHeading = (level: number): void => {
    const textarea = document.getElementById('document-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = content.indexOf('\n', start);
    const line = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);
    
    const headingText = line.trim().replace(/^#{1,6}\s/, '');
    const heading = '#'.repeat(level) + ' ' + headingText + '\n';
    
    const newContent = 
      content.substring(0, lineStart) + 
      heading + 
      content.substring(lineEnd === -1 ? content.length : lineEnd + 1);
    
    setContent(newContent);
  };

  const formatSelection = (type: string): void => {
    const textarea = document.getElementById('document-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) return;

    let formatted = '';
    switch (type) {
      case 'bold':
        formatted = `**${selectedText}**`;
        break;
      case 'italic':
        formatted = `*${selectedText}*`;
        break;
      case 'underline':
        formatted = `__${selectedText}__`;
        break;
      case 'code':
        formatted = `\`${selectedText}\``;
        break;
      default:
        return;
    }

    const newContent = 
      content.substring(0, start) + 
      formatted + 
      content.substring(end);
    
    setContent(newContent);
  };

  const insertList = (ordered: boolean): void => {
    const textarea = document.getElementById('document-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const lines = selectedText.split('\n').filter(line => line.trim());
    const listItems = lines.map((line, index) => {
      const prefix = ordered ? `${index + 1}. ` : '• ';
      return prefix + line.trim();
    }).join('\n');
    
    const newContent = 
      content.substring(0, start) + 
      (listItems || (ordered ? '1. ' : '• ')) + 
      content.substring(end);
    
    setContent(newContent);
  };

  const resetContent = (): void => {
    if (window.confirm('Reset to original content? All changes will be lost.')) {
      setContent(initialContent);
      setHasChanges(false);
    }
  };

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(content);
    alert('Content copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-neural to-passion text-white">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <RiTextWrap />
              Document Editor
            </h2>
            <p className="text-sm opacity-90 mt-1">{title}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm mr-4">
              <div className="font-semibold">{wordCount.toLocaleString()} words</div>
              {hasChanges && <div className="text-xs opacity-80">Unsaved changes</div>}
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              <RiCloseLine className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b bg-gray-50 flex-wrap">
          {/* Heading buttons */}
          <div className="flex gap-1 pr-3 border-r">
            <ToolbarButton
              icon={<RiH1 />}
              tooltip="Heading 1"
              onClick={() => insertHeading(1)}
            />
            <ToolbarButton
              icon={<RiH2 />}
              tooltip="Heading 2"
              onClick={() => insertHeading(2)}
            />
            <ToolbarButton
              icon={<RiH3 />}
              tooltip="Heading 3"
              onClick={() => insertHeading(3)}
            />
          </div>

          {/* Formatting buttons */}
          <div className="flex gap-1 pr-3 border-r">
            <ToolbarButton
              icon={<RiBold />}
              tooltip="Bold"
              onClick={() => formatSelection('bold')}
            />
            <ToolbarButton
              icon={<RiItalic />}
              tooltip="Italic"
              onClick={() => formatSelection('italic')}
            />
            <ToolbarButton
              icon={<RiUnderline />}
              tooltip="Underline"
              onClick={() => formatSelection('underline')}
            />
          </div>

          {/* List buttons */}
          <div className="flex gap-1 pr-3 border-r">
            <ToolbarButton
              icon={<RiListUnordered />}
              tooltip="Bullet List"
              onClick={() => insertList(false)}
            />
            <ToolbarButton
              icon={<RiListOrdered />}
              tooltip="Numbered List"
              onClick={() => insertList(true)}
            />
          </div>

          {/* Utility buttons */}
          <div className="flex gap-1 ml-auto">
            <ToolbarButton
              icon={<RiFileCopyLine />}
              tooltip="Copy to Clipboard"
              onClick={copyToClipboard}
            />
            <ToolbarButton
              icon={<RiRefreshLine />}
              tooltip="Reset to Original"
              onClick={resetContent}
            />
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <textarea
            id="document-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-6 resize-none focus:outline-none font-sans text-base leading-relaxed text-neural"
            placeholder="Start editing your document..."
            spellCheck={true}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {hasChanges ? (
              <span className="text-passion font-medium">● Unsaved changes</span>
            ) : (
              <span className="text-verdant font-medium">✓ All changes saved</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="rounded-full bg-passion hover:bg-passion-dark"
            >
              <RiSaveLine className="mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Toolbar Button Component
function ToolbarButton({ 
  icon, 
  tooltip, 
  onClick 
}: { 
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-neural"
    >
      {icon}
    </button>
  );
}

