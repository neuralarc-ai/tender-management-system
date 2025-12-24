'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
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
  RiH1,
  RiH2,
  RiH3,
  RiTableLine,
  RiFormatClear,
  RiFileCopyLine,
  RiRefreshLine,
  RiPrinterLine,
  RiZoomInLine,
  RiZoomOutLine
} from 'react-icons/ri';

interface VisualDocumentEditorProps {
  documentId: string;
  initialContent: string;
  title: string;
  onSave: (content: string) => Promise<void>;
  onClose: () => void;
}

export function VisualDocumentEditor({ 
  documentId, 
  initialContent, 
  title, 
  onSave, 
  onClose 
}: VisualDocumentEditorProps): JSX.Element {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(100);

  // Convert plain text to HTML for initial display
  const convertTextToHTML = (text: string): string => {
    // Split by double line breaks for paragraphs
    const paragraphs = text.split(/\n\n+/);
    
    let html = '';
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      // Check if it's a heading (all caps or starts with section number)
      if (trimmed.match(/^[A-Z\s]{15,}$/) || trimmed.match(/^SECTION \d+/i) || trimmed.match(/^\d+\./)) {
        if (trimmed.length > 40) {
          html += `<h2>${trimmed}</h2>`;
        } else {
          html += `<h3>${trimmed}</h3>`;
        }
      }
      // Check if it's a table (contains | characters)
      else if (trimmed.includes('|') && trimmed.split('|').length > 2) {
        html += convertTableToHTML(trimmed);
      }
      // Check if it's a list item
      else if (trimmed.match(/^[•\-\*]\s/) || trimmed.match(/^\d+\.\s/)) {
        const lines = para.split('\n').filter(l => l.trim());
        const isOrdered = lines[0].match(/^\d+\.\s/);
        html += isOrdered ? '<ol>' : '<ul>';
        for (const line of lines) {
          const content = line.replace(/^[•\-\*\d+\.]\s*/, '');
          html += `<li>${content}</li>`;
        }
        html += isOrdered ? '</ol>' : '</ul>';
      }
      // Regular paragraph
      else {
        // Convert line breaks to <br> within paragraph
        const withBreaks = trimmed.replace(/\n/g, '<br>');
        html += `<p>${withBreaks}</p>`;
      }
    }
    
    return html || '<p></p>';
  };

  const convertTableToHTML = (tableText: string): string => {
    const lines = tableText.split('\n').filter(l => l.trim());
    let html = '<table><tbody>';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('---') || line.includes('===')) continue; // Skip separator lines
      
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length === 0) continue;
      
      html += '<tr>';
      // First row is header
      const tag = i === 0 ? 'th' : 'td';
      for (const cell of cells) {
        html += `<${tag}>${cell}</${tag}>`;
      }
      html += '</tr>';
    }
    
    html += '</tbody></table>';
    return html;
  };

  const convertHTMLToText = (html: string): string => {
    // Create a temporary element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    let text = '';
    
    const processNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        // Add spacing before block elements
        if (['h1', 'h2', 'h3', 'p', 'div', 'table', 'ul', 'ol'].includes(tagName)) {
          if (text && !text.endsWith('\n')) text += '\n\n';
        }
        
        // Process children
        Array.from(element.childNodes).forEach(processNode);
        
        // Add spacing after block elements
        if (['h1', 'h2', 'h3', 'p', 'div', 'li'].includes(tagName)) {
          if (!text.endsWith('\n')) text += '\n';
        }
        
        if (tagName === 'br') {
          text += '\n';
        }
      }
    };
    
    processNode(temp);
    return text.trim();
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: convertTextToHTML(initialContent),
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[800px] p-12 bg-white',
      },
    },
    onUpdate: ({ editor }) => {
      setHasChanges(true);
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  }, [editor]);

  const handleSave = async (): Promise<void> => {
    if (!editor) return;
    
    setIsSaving(true);
    try {
      const htmlContent = editor.getHTML();
      const textContent = convertHTMLToText(htmlContent);
      await onSave(textContent);
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

  const handlePrint = (): void => {
    window.print();
  };

  const resetContent = (): void => {
    if (window.confirm('Reset to original content? All changes will be lost.')) {
      editor?.commands.setContent(convertTextToHTML(initialContent));
      setHasChanges(false);
    }
  };

  const copyToClipboard = (): void => {
    if (editor) {
      const text = editor.getText();
      navigator.clipboard.writeText(text);
      alert('Content copied to clipboard!');
    }
  };

  const adjustZoom = (delta: number): void => {
    setZoom(prev => Math.max(50, Math.min(200, prev + delta)));
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-neural">{title}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-semibold">{wordCount.toLocaleString()} words</span>
            {hasChanges && <span className="text-passion">• Unsaved changes</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => adjustZoom(-10)}
              className="rounded"
            >
              <RiZoomOutLine />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[50px] text-center">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => adjustZoom(10)}
              className="rounded"
            >
              <RiZoomInLine />
            </Button>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <RiCloseLine className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-6 py-3 bg-white border-b overflow-x-auto">
        {/* Text Style */}
        <div className="flex gap-1 pr-3 border-r">
          <ToolbarButton
            icon={<RiH1 />}
            tooltip="Heading 1"
            isActive={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          />
          <ToolbarButton
            icon={<RiH2 />}
            tooltip="Heading 2"
            isActive={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          />
          <ToolbarButton
            icon={<RiH3 />}
            tooltip="Heading 3"
            isActive={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          />
        </div>

        {/* Formatting */}
        <div className="flex gap-1 pr-3 border-r">
          <ToolbarButton
            icon={<RiBold />}
            tooltip="Bold"
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            icon={<RiItalic />}
            tooltip="Italic"
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            icon={<RiUnderline />}
            tooltip="Underline"
            isActive={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
        </div>

        {/* Lists */}
        <div className="flex gap-1 pr-3 border-r">
          <ToolbarButton
            icon={<RiListUnordered />}
            tooltip="Bullet List"
            isActive={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            icon={<RiListOrdered />}
            tooltip="Numbered List"
            isActive={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 pr-3 border-r">
          <ToolbarButton
            icon={<RiAlignLeft />}
            tooltip="Align Left"
            isActive={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          />
          <ToolbarButton
            icon={<RiAlignCenter />}
            tooltip="Align Center"
            isActive={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          />
          <ToolbarButton
            icon={<RiAlignRight />}
            tooltip="Align Right"
            isActive={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          />
        </div>

        {/* Table */}
        <div className="flex gap-1 pr-3 border-r">
          <ToolbarButton
            icon={<RiTableLine />}
            tooltip="Insert Table"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          />
        </div>

        {/* Utilities */}
        <div className="flex gap-1 ml-auto">
          <ToolbarButton
            icon={<RiFormatClear />}
            tooltip="Clear Formatting"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          />
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
          <ToolbarButton
            icon={<RiPrinterLine />}
            tooltip="Print"
            onClick={handlePrint}
          />
        </div>
      </div>

      {/* Editor Content - PDF-like appearance */}
      <div 
        className="flex-1 overflow-y-auto bg-gray-200 p-8"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
      >
        <div className="max-w-[21cm] mx-auto bg-white shadow-2xl">
          <style jsx global>{`
            .ProseMirror {
              min-height: 29.7cm;
              padding: 2.54cm;
              font-family: 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
            }
            
            .ProseMirror h1 {
              font-size: 24pt;
              font-weight: bold;
              margin: 24pt 0 12pt 0;
              color: #1a1a1a;
            }
            
            .ProseMirror h2 {
              font-size: 18pt;
              font-weight: bold;
              margin: 18pt 0 9pt 0;
              color: #1a1a1a;
            }
            
            .ProseMirror h3 {
              font-size: 14pt;
              font-weight: bold;
              margin: 14pt 0 7pt 0;
              color: #1a1a1a;
            }
            
            .ProseMirror p {
              margin: 0 0 12pt 0;
              text-align: justify;
            }
            
            .ProseMirror ul,
            .ProseMirror ol {
              padding-left: 24pt;
              margin: 12pt 0;
            }
            
            .ProseMirror li {
              margin: 6pt 0;
            }
            
            .ProseMirror table {
              border-collapse: collapse;
              width: 100%;
              margin: 12pt 0;
            }
            
            .ProseMirror table td,
            .ProseMirror table th {
              border: 1px solid #000;
              padding: 8pt;
              text-align: left;
            }
            
            .ProseMirror table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            
            .ProseMirror strong {
              font-weight: bold;
            }
            
            .ProseMirror em {
              font-style: italic;
            }
            
            .ProseMirror u {
              text-decoration: underline;
            }
            
            @media print {
              .ProseMirror {
                padding: 0;
                box-shadow: none;
              }
            }
          `}</style>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t shadow-sm">
        <div className="text-sm">
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
    </div>
  );
}

// Toolbar Button Component
function ToolbarButton({ 
  icon, 
  tooltip, 
  onClick,
  isActive = false
}: { 
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  isActive?: boolean;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`p-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-passion text-white' 
          : 'hover:bg-gray-200 text-neural'
      }`}
    >
      {icon}
    </button>
  );
}

