/**
 * Markdown Parser for PDF Generation
 * Preserves formatting (bold, italic, code) and structure
 */

export interface MarkdownNode {
  type: 'heading' | 'paragraph' | 'table' | 'list' | 'horizontal-rule' | 'code-block';
  level?: number;
  content: string;
  children?: MarkdownNode[];
  data?: any;
}

export interface InlineNode {
  type: 'text' | 'bold' | 'italic' | 'code' | 'link';
  content: string;
  url?: string;
}

export class MarkdownParser {
  /**
   * Parse markdown content into structured nodes
   */
  static parse(content: string): MarkdownNode[] {
    const nodes: MarkdownNode[] = [];
    const lines = content.split('\n');
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      
      // Skip empty lines
      if (line.trim().length === 0) {
        i++;
        continue;
      }
      
      // Heading (# ## ###)
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        nodes.push({
          type: 'heading',
          level: headingMatch[1].length,
          content: headingMatch[2].trim()
        });
        i++;
        continue;
      }
      
      // Horizontal rule (--- or ***)
      if (line.match(/^\s*[-*_]{3,}\s*$/)) {
        nodes.push({
          type: 'horizontal-rule',
          content: ''
        });
        i++;
        continue;
      }
      
      // Table (| col1 | col2 |) - More flexible detection
      if (line.trim().includes('|') && line.split('|').filter(c => c.trim()).length >= 2) {
        const table = this.parseTable(lines, i);
        if (table) {
          nodes.push(table.node);
          i = table.nextIndex;
          continue;
        }
      }
      
      // Bullet list (- * •)
      if (line.match(/^\s*[-*•]\s+/)) {
        const list = this.parseList(lines, i, 'bullet');
        nodes.push(list.node);
        i = list.nextIndex;
        continue;
      }
      
      // Numbered list (1. 2. 3.)
      if (line.match(/^\s*\d+[.)]\s+/)) {
        const list = this.parseList(lines, i, 'numbered');
        nodes.push(list.node);
        i = list.nextIndex;
        continue;
      }
      
      // Lettered list (a. b. c.)
      if (line.match(/^\s*[a-z][.)]\s+/i)) {
        const list = this.parseList(lines, i, 'lettered');
        nodes.push(list.node);
        i = list.nextIndex;
        continue;
      }
      
      // Code block (```)
      if (line.trim().startsWith('```')) {
        const codeBlock = this.parseCodeBlock(lines, i);
        if (codeBlock) {
          nodes.push(codeBlock.node);
          i = codeBlock.nextIndex;
          continue;
        }
      }
      
      // Regular paragraph
      nodes.push({
        type: 'paragraph',
        content: line.trim()
      });
      i++;
    }
    
    return nodes;
  }
  
  /**
   * Parse inline formatting (bold, italic, code, links)
   */
  static parseInline(text: string): InlineNode[] {
    const nodes: InlineNode[] = [];
    let currentPos = 0;
    
    // Regex patterns for inline formatting
    const patterns = [
      { regex: /\*\*\*(.+?)\*\*\*/g, type: 'bold-italic' },
      { regex: /\*\*(.+?)\*\*/g, type: 'bold' },
      { regex: /\*(.+?)\*/g, type: 'italic' },
      { regex: /__(.+?)__/g, type: 'bold' },
      { regex: /_(.+?)_/g, type: 'italic' },
      { regex: /`(.+?)`/g, type: 'code' },
      { regex: /\[(.+?)\]\((.+?)\)/g, type: 'link' }
    ];
    
    while (currentPos < text.length) {
      let earliestMatch: any = null;
      let earliestPos = text.length;
      let matchedPattern: any = null;
      
      // Find the earliest pattern match
      for (const pattern of patterns) {
        pattern.regex.lastIndex = currentPos;
        const match = pattern.regex.exec(text);
        if (match && match.index < earliestPos) {
          earliestMatch = match;
          earliestPos = match.index;
          matchedPattern = pattern;
        }
      }
      
      if (earliestMatch) {
        // Add text before match
        if (earliestPos > currentPos) {
          nodes.push({
            type: 'text',
            content: text.substring(currentPos, earliestPos)
          });
        }
        
        // Add formatted node
        if (matchedPattern.type === 'link') {
          nodes.push({
            type: 'link',
            content: earliestMatch[1],
            url: earliestMatch[2]
          });
        } else if (matchedPattern.type === 'bold-italic') {
          // Handle bold+italic by treating as bold
          nodes.push({
            type: 'bold',
            content: earliestMatch[1]
          });
        } else {
          nodes.push({
            type: matchedPattern.type as any,
            content: earliestMatch[1]
          });
        }
        
        currentPos = earliestPos + earliestMatch[0].length;
      } else {
        // No more matches, add remaining text
        nodes.push({
          type: 'text',
          content: text.substring(currentPos)
        });
        break;
      }
    }
    
    // If no formatting found, return plain text
    if (nodes.length === 0) {
      nodes.push({ type: 'text', content: text });
    }
    
    return nodes;
  }
  
  /**
   * Parse markdown table with flexible format detection
   */
  private static parseTable(lines: string[], startIndex: number): { node: MarkdownNode; nextIndex: number } | null {
    const headers: string[] = [];
    const rows: string[][] = [];
    let i = startIndex;
    
    // Parse header row - be flexible with format
    const headerLine = lines[i].trim();
    const headerCells = headerLine
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);
    
    if (headerCells.length < 2) {
      return null; // Need at least 2 columns
    }
    
    headers.push(...headerCells);
    i++;
    
    // Skip separator row (|---|---| or |:---|:---| etc.)
    if (i < lines.length && (lines[i].includes('---') || lines[i].includes(':-'))) {
      i++;
    }
    
    // Parse data rows - be flexible
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Stop if line doesn't look like table row
      if (!line.includes('|')) {
        break;
      }
      
      // Check if it's a separator line (skip it)
      if (line.includes('---') || line.includes('===')) {
        i++;
        continue;
      }
      
      const cells = line
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      // Only add if we have cells
      if (cells.length > 0) {
        // Pad with empty cells if row is shorter than header
        while (cells.length < headers.length) {
          cells.push('');
        }
        // Trim if row is longer than header
        if (cells.length > headers.length) {
          cells.length = headers.length;
        }
        rows.push(cells);
      }
      i++;
    }
    
    // Only return table if we have at least one data row
    if (rows.length === 0) {
      return null;
    }
    
    return {
      node: {
        type: 'table',
        content: '',
        data: { headers, rows }
      },
      nextIndex: i
    };
  }
  
  /**
   * Parse list (bullet, numbered, or lettered)
   */
  private static parseList(
    lines: string[], 
    startIndex: number, 
    listType: 'bullet' | 'numbered' | 'lettered'
  ): { node: MarkdownNode; nextIndex: number } {
    const items: MarkdownNode[] = [];
    let i = startIndex;
    
    const patterns = {
      bullet: /^\s*([-*•])\s+(.+)$/,
      numbered: /^\s*(\d+)[.)]\s+(.+)$/,
      lettered: /^\s*([a-z])[.)]\s+(.+)$/i
    };
    
    const pattern = patterns[listType];
    
    while (i < lines.length) {
      const line = lines[i];
      const match = line.match(pattern);
      
      if (!match) {
        break;
      }
      
      items.push({
        type: 'paragraph',
        content: match[2].trim()
      });
      
      i++;
    }
    
    return {
      node: {
        type: 'list',
        content: '',
        data: { listType, items },
        children: items
      },
      nextIndex: i
    };
  }
  
  /**
   * Parse code block
   */
  private static parseCodeBlock(lines: string[], startIndex: number): { node: MarkdownNode; nextIndex: number } | null {
    let i = startIndex + 1; // Skip opening ```
    const codeLines: string[] = [];
    
    while (i < lines.length) {
      if (lines[i].trim().startsWith('```')) {
        // Found closing ```
        return {
          node: {
            type: 'code-block',
            content: codeLines.join('\n')
          },
          nextIndex: i + 1
        };
      }
      codeLines.push(lines[i]);
      i++;
    }
    
    // No closing ```, treat as regular text
    return null;
  }
}

