import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';

/**
 * Gemini Document Parser Service
 * Uses Gemini 3 Pro to extract tender information from uploaded documents
 */

interface ParsedTenderData {
  title: string;
  description: string;
  scopeOfWork: string;
  technicalRequirements: string;
  functionalRequirements: string;
  eligibilityCriteria: string;
  submissionDeadline: string;
  extractedSections: {
    budget?: string;
    timeline?: string;
    deliverables?: string;
    additionalInfo?: string;
  };
  confidence: number;
  warnings: string[];
}

class GeminiDocumentParserService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Using Gemini 3 Pro - most intelligent model for complex document parsing
      // See: https://ai.google.dev/gemini-api/docs/gemini-3
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-3-pro-preview'
      });
    }
  }

  /**
   * Check if Gemini is properly configured
   */
  isConfigured(): boolean {
    return this.genAI !== null && this.model !== null;
  }

  /**
   * Extract text from document based on MIME type
   */
  private async extractTextFromDocument(
    fileContent: string,
    mimeType: string,
    fileName: string
  ): Promise<string> {
    try {
      // For DOCX files, extract text first
      if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const buffer = Buffer.from(fileContent, 'base64');
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }
      
      // For DOC files (older format)
      if (mimeType === 'application/msword') {
        // Try to extract as text, fallback to base64
        try {
          const buffer = Buffer.from(fileContent, 'base64');
          const result = await mammoth.extractRawText({ buffer });
          return result.value;
        } catch {
          return '[Document format not fully supported - please use DOCX or PDF]';
        }
      }

      // For PDF, we'll send as-is (Gemini can handle PDFs)
      // For other formats, return as-is
      return fileContent;
    } catch (error: any) {
      console.error('Error extracting text:', error);
      throw new Error(`Failed to extract text from ${fileName}: ${error.message}`);
    }
  }

  /**
   * Parse document content and extract tender information
   */
  async parseDocument(
    fileContent: string,
    fileName: string,
    mimeType: string
  ): Promise<ParsedTenderData> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY in environment variables.');
    }

    try {
      const prompt = this.buildExtractionPrompt(fileName);
      
      // Extract text for DOCX/DOC files, or use original for PDFs
      const isTextExtraction = mimeType.includes('word') || mimeType === 'application/msword';
      
      let result;
      if (isTextExtraction) {
        // Extract text and send as text
        const extractedText = await this.extractTextFromDocument(fileContent, mimeType, fileName);
        result = await this.model.generateContent([
          prompt,
          `\n\nDocument Content:\n${extractedText}`
        ]);
      } else {
        // Send document directly (for PDFs)
        result = await this.model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType,
              data: fileContent
            }
          }
        ]);
      }

      const response = await result.response;
      const text = response.text();
      
      // Parse the structured JSON response
      const parsedData = this.parseGeminiResponse(text);
      
      return parsedData;
    } catch (error: any) {
      console.error('Gemini document parsing error:', error);
      throw new Error(`Failed to parse document: ${error.message}`);
    }
  }

  /**
   * Parse multiple documents and merge the information
   */
  async parseMultipleDocuments(
    documents: Array<{ content: string; fileName: string; mimeType: string }>
  ): Promise<ParsedTenderData> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY in environment variables.');
    }

    try {
      // Parse each document
      const parsedResults = await Promise.all(
        documents.map(doc => this.parseDocument(doc.content, doc.fileName, doc.mimeType))
      );

      // Merge results intelligently
      return this.mergeParseResults(parsedResults);
    } catch (error: any) {
      console.error('Multiple document parsing error:', error);
      throw new Error(`Failed to parse documents: ${error.message}`);
    }
  }

  /**
   * Build the extraction prompt for Gemini
   */
  private buildExtractionPrompt(fileName: string): string {
    return `You are an expert at analyzing tender and RFP documents. Extract ALL relevant information from the provided document and structure it as JSON.

Document Name: ${fileName}

Extract and return ONLY a valid JSON object with the following structure (no additional text or markdown):

{
  "title": "Project/Tender title (if found, otherwise generate from document content)",
  "description": "Comprehensive project description and overview",
  "scopeOfWork": "Detailed scope of work, deliverables, and project phases",
  "technicalRequirements": "All technical specifications, technologies, platforms, integrations required",
  "functionalRequirements": "Functional requirements, features, capabilities expected",
  "eligibilityCriteria": "Vendor qualifications, certifications, experience requirements",
  "submissionDeadline": "Deadline in ISO format if found (YYYY-MM-DDTHH:mm), otherwise empty string",
  "extractedSections": {
    "budget": "Budget information if mentioned",
    "timeline": "Project timeline and milestones",
    "deliverables": "Specific deliverables list",
    "additionalInfo": "Any other important information"
  },
  "confidence": 0.95,
  "warnings": ["List any missing or unclear information"]
}

IMPORTANT INSTRUCTIONS:
1. Extract ALL information from the document - be thorough and detailed
2. If a section is not found, provide a reasonable interpretation based on context
3. For technical and functional requirements, list each requirement clearly
4. Format dates as ISO 8601 (YYYY-MM-DDTHH:mm:ss) when found
5. Set confidence score (0-1) based on document clarity
6. Add warnings for missing critical information
7. Return ONLY the JSON object, no markdown formatting, no explanations
8. Ensure the JSON is valid and properly escaped

Begin extraction:`;
  }

  /**
   * Parse Gemini's response and extract JSON
   */
  private parseGeminiResponse(responseText: string): ParsedTenderData {
    try {
      // Remove markdown code blocks if present
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleanedText);
      
      // Validate required fields
      const requiredFields = [
        'title',
        'description',
        'scopeOfWork',
        'technicalRequirements',
        'functionalRequirements',
        'eligibilityCriteria'
      ];

      const warnings: string[] = parsed.warnings || [];
      
      requiredFields.forEach(field => {
        const fieldValue = parsed[field];
        // Check if field exists and is a string before calling trim
        if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
          warnings.push(`Missing or empty field: ${field}`);
          parsed[field] = `[Auto-extracted - Please review and complete]`;
        }
      });

      // Smart deadline handling - if deadline is in the past, adjust it
      if (parsed.submissionDeadline) {
        const deadlineDate = new Date(parsed.submissionDeadline);
        const now = new Date();
        
        if (deadlineDate < now) {
          // Deadline is in the past - calculate how many days it was from document date
          const daysDiff = Math.abs(Math.floor((now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24)));
          
          // Set deadline to same number of days in the future (with buffer)
          const adjustedDeadline = new Date(now);
          adjustedDeadline.setDate(adjustedDeadline.getDate() + Math.max(daysDiff, 7)); // At least 7 days
          
          parsed.submissionDeadline = adjustedDeadline.toISOString();
          warnings.push(`Original deadline (${deadlineDate.toLocaleDateString()}) was in the past. Adjusted to ${adjustedDeadline.toLocaleDateString()}. Please verify this is correct.`);
        }
      }

      return {
        ...parsed,
        warnings,
        confidence: parsed.confidence || 0.8
      };
    } catch (error: any) {
      console.error('Failed to parse Gemini response:', error);
      throw new Error('Failed to parse AI response. The document format may not be supported.');
    }
  }

  /**
   * Merge multiple parsed results intelligently
   */
  private mergeParseResults(results: ParsedTenderData[]): ParsedTenderData {
    if (results.length === 0) {
      throw new Error('No documents to merge');
    }

    if (results.length === 1) {
      return results[0];
    }

    // Take the result with highest confidence as base
    const sortedResults = [...results].sort((a, b) => b.confidence - a.confidence);
    const merged = { ...sortedResults[0] };

    // Merge information from other documents
    results.forEach((result, index) => {
      if (index === 0) return; // Skip the base result

      // Merge descriptions
      if (result.description && result.description !== merged.description) {
        merged.description += `\n\n${result.description}`;
      }

      // Merge technical requirements
      if (result.technicalRequirements && !merged.technicalRequirements.includes(result.technicalRequirements)) {
        merged.technicalRequirements += `\n\n${result.technicalRequirements}`;
      }

      // Merge functional requirements
      if (result.functionalRequirements && !merged.functionalRequirements.includes(result.functionalRequirements)) {
        merged.functionalRequirements += `\n\n${result.functionalRequirements}`;
      }

      // Merge scope of work
      if (result.scopeOfWork && !merged.scopeOfWork.includes(result.scopeOfWork)) {
        merged.scopeOfWork += `\n\n${result.scopeOfWork}`;
      }

      // Merge eligibility criteria
      if (result.eligibilityCriteria && !merged.eligibilityCriteria.includes(result.eligibilityCriteria)) {
        merged.eligibilityCriteria += `\n\n${result.eligibilityCriteria}`;
      }

      // Merge extracted sections
      Object.keys(result.extractedSections).forEach(key => {
        const typedKey = key as keyof typeof result.extractedSections;
        if (result.extractedSections[typedKey] && !merged.extractedSections[typedKey]) {
          merged.extractedSections[typedKey] = result.extractedSections[typedKey];
        }
      });

      // Merge warnings
      merged.warnings = Array.from(new Set([...merged.warnings, ...result.warnings]));
    });

    // Average confidence
    merged.confidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    merged.warnings.push(`Merged information from ${results.length} documents`);

    return merged;
  }

  /**
   * Validate parsed data before submission
   */
  validateParsedData(data: ParsedTenderData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.length < 10) {
      errors.push('Title is too short or missing');
    }

    if (!data.description || data.description.length < 50) {
      errors.push('Description is too brief');
    }

    if (!data.submissionDeadline) {
      errors.push('Submission deadline not found - please enter manually');
    }

    if (data.confidence < 0.6) {
      errors.push('Low confidence in extracted data - please review carefully');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const geminiDocumentParser = new GeminiDocumentParserService();
export type { ParsedTenderData };

