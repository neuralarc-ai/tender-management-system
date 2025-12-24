import { GoogleGenerativeAI } from '@google/generative-ai';
import { Tender } from '@/types';

/**
 * Tender Document Generator Service
 * Uses Gemini 3 Pro to generate professional Neural Arc proposal documents
 */

interface GeneratedDocument {
  title: string;
  content: string;
  sections: DocumentSection[];
  metadata: {
    wordCount: number;
    pageCount: number;
    generatedAt: string;
  };
}

interface DocumentSection {
  title: string;
  content: string;
  order: number;
}

class TenderDocumentGeneratorService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-3-pro-preview',
        generationConfig: {
          thinkingConfig: {
            thinkingLevel: 'high'
          }
        }
      });
    }
  }

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return this.genAI !== null && this.model !== null;
  }

  /**
   * Generate professional tender document (Neural Arc proposal)
   */
  async generateTenderDocument(tender: any): Promise<GeneratedDocument> {
    if (!this.isConfigured()) {
      throw new Error('Document generation service not configured. Please set GEMINI_API_KEY.');
    }

    try {
      const prompt = this.buildDocumentPrompt(tender);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Parse the generated content
      const sections = this.parseDocumentSections(content);
      const metadata = this.calculateMetadata(content);

      return {
        title: `${tender.title} - Neural Arc Proposal`,
        content,
        sections,
        metadata: {
          ...metadata,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('Document generation error:', error);
      throw new Error(`Failed to generate document: ${error.message}`);
    }
  }

  /**
   * Build comprehensive prompt - Neural Arc Proposals
   */
  private buildDocumentPrompt(tender: any): string {
    const deadline = new Date(tender.submissionDeadline || tender.submission_deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const rfqNumber = `RFQ ${Date.now().toString().slice(-8)}`;
    const currentMonth = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });

    const techReqs = tender.technical_requirements || tender.technicalRequirements || 'Standard technical requirements';
    const funcReqs = tender.functional_requirements || tender.functionalRequirements || 'Standard functional requirements';
    const scope = tender.scope_of_work || tender.scopeOfWork || 'As specified in RFQ';

    return `Create a professional PROPOSAL document from Neural Arc Inc responding to a client tender.

Project: ${tender.title}
RFQ Reference: ${rfqNumber}
Deadline: ${deadline}

Technical Requirements: ${techReqs}
Functional Requirements: ${funcReqs}
Scope: ${scope}

Generate a complete professional proposal matching this structure:

COVER PAGE:
NEURAL ARC
${tender.title}
Proposal
Implementation and Delivery

${rfqNumber}

Pioneering Generative AI Solutions for Enterprise Excellence

${currentMonth}

ABOUT NEURAL ARC

Who We Are

Write 2-3 paragraphs about Neural Arc as a specialized technology consultancy focused on generative AI innovation, delivering cutting-edge AI solutions for enterprises. Mention we are AI engineers, data scientists, and software architects making AI accessible and transformative.

Our Generative AI Expertise

Write 2 paragraphs about specializing in generative AI that enables machines to create, reason, and solve problems with human-like intelligence.

OUR GENERATIVE AI CAPABILITIES

Create a table:
Domain | Capabilities
Natural Language Processing | Conversational AI, Document extraction, Content generation, Sentiment analysis
Intelligent Automation | Workflow orchestration, Autonomous systems, Process mining, RPA
Predictive Analytics | Forecasting, Risk assessment, Anomaly detection, Performance prediction
Computer Vision | Document analysis, Object detection, Quality inspection

Our Track Record

Write about successful deployments across industries including healthcare, finance, government, manufacturing.

Include stats: 5 Pilot Projects | 4 Active Implementations | 4 Global Markets | 100% Client Satisfaction

Why Neural Arc for This Project

List key strengths: AI expertise, enterprise focus, proven delivery, global experience, security compliance, technical certifications, innovation mindset.

UNDERSTANDING THE RFQ

Project Context

Expand on: ${tender.description}

Explain we understand this is critical and requires qualified partner.

Current Situation

Based on RFQ analysis, client needs partner who can:
• Deliver comprehensive solution
• Meet all requirements  
• Integrate with systems
• Ensure quality and compliance
• Provide training and support

Key Stakeholders

Create stakeholder table based on project type.

SCOPE OF WORK - OUR UNDERSTANDING

1. System Analysis & Design

WHAT WE UNDERSTAND
[Interpret requirements]

OUR APPROACH
• Comprehensive assessment
• Architecture design
• Project planning
• Risk mitigation

2. Core Implementation

Based on functional requirements, deliver:
• User management
• Core features
• Integrations
• Workflows
• Reporting

3. Technical Solution

Based on technical requirements:

TECHNICAL SPECIFICATIONS

Category | Our Proposed Solution
Platform & Infrastructure | Modern scalable architecture, cloud-native, industry frameworks
Performance & Scalability | 99.9% uptime, optimized performance, horizontal scaling
Security & Compliance | End-to-end encryption, RBAC, audits, compliance
Integration | RESTful APIs, webhooks, seamless integration

IMPLEMENTATION TIMELINE

5-Month Delivery Plan

Create detailed timeline table:
Month | Phase | Key Activities | Deliverables
Month 1 | Planning | Requirements, Design, Setup | Design docs, Project plan
Month 2-3 | Development | Core build, Integration, Testing | Working system
Month 4 | UAT | Testing, Refinement, Optimization | UAT report
Month 5 | Deployment | Production, Training, Go-live | Live system

COMMERCIAL PROPOSAL

Pricing Philosophy

Write about transparent value-driven pricing that reflects actual effort. Fair pricing aligning success.

Rate Structure

• Base Development Cost: Standard industry rate
• Overhead & Management: Covers PM, QA, infrastructure  
• Effective Billing Rate: Calculated competitive rate

Total Project Investment

INVESTMENT SUMMARY: [Calculate appropriate amount based on project scope]

Payment Schedule

Create milestone payment table:
Milestone | Deliverable | Payment %
Milestone 1 | Design completion | 25%
Milestone 2 | MVP delivery | 30%
Milestone 3 | Testing completion | 25%
Milestone 4 | Go-live | 20%

CONCLUSION & NEXT STEPS

Why Neural Arc is Your Ideal Partner

List key differentiators:
• Generative AI leadership
• Proven track record
• Enterprise focus  
• Technical expertise
• Global experience
• Transparent approach

Our Commitment

Neural Arc commits to:
• Quality excellence
• Timely delivery
• Security compliance
• Knowledge transfer
• Transparent communication
• Partnership mindset

Expected Outcomes

Upon completion, client will have:
• Functional system meeting requirements
• Complete documentation
• Trained team
• Scalable secure solution
• Ongoing support

FOR QUESTIONS OR CLARIFICATIONS

EMAIL ADDRESS: contact@neuralarc.ai
PHONE NUMBER: +971 [Contact]
WEBSITE: www.neuralarc.ai

PRIMARY CONTACT:
Aniket Tapre
Founder, Neural Arc Inc

Thank You

Write professional thank you expressing appreciation for opportunity and looking forward to partnership to deliver world-class solution.

© ${new Date().getFullYear()} Neural Arc Inc. All rights reserved.
Confidential and Proprietary

This proposal is submitted in response to ${rfqNumber} and is valid for 90 days from submission date.

CRITICAL INSTRUCTIONS:
1. Write COMPLETE professional proposal with full paragraphs
2. Expand ALL sections with substantial content
3. Use formal business language
4. Create proper tables with | separators
5. Minimum 4000 words
6. NO markdown formatting symbols (no asterisks, hashes, backticks)
7. Write clean professional text
8. Make it detailed and comprehensive
9. Focus on Neural Arc capabilities and approach
10. Ready for client submission

Generate complete proposal now:`;
  }

  /**
   * Parse document into sections
   */
  private parseDocumentSections(content: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = content.split('\n');
    let currentSection: DocumentSection | null = null;
    let order = 0;

    for (const line of lines) {
      // Check if line is a main heading
      if (line.match(/^[A-Z\s]{10,}$/) || line.match(/^SECTION \d+/i)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.trim(),
          content: '',
          order: order++
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Calculate document metadata
   */
  private calculateMetadata(content: string): { wordCount: number; pageCount: number } {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const pageCount = Math.ceil(wordCount / 500);

    return {
      wordCount,
      pageCount
    };
  }

  /**
   * Generate summary document
   */
  async generateSummaryDocument(tender: any): Promise<GeneratedDocument> {
    if (!this.isConfigured()) {
      throw new Error('Document generation service not configured.');
    }

    const prompt = `Create a 1-page executive summary proposal from Neural Arc Inc for:

Title: ${tender.title}
Description: ${tender.description}

Include:
- Project Overview (2-3 sentences)
- Key Requirements (5-7 bullets)
- Our Approach (3-4 bullets)
- Timeline estimate
- Contact: contact@neuralarc.ai

Professional tone, under 400 words, NO markdown symbols.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return {
        title: `${tender.title} - Executive Summary`,
        content,
        sections: [],
        metadata: {
          wordCount: content.split(/\s+/).length,
          pageCount: 1,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }
}

// Export singleton instance
export const tenderDocumentGenerator = new TenderDocumentGeneratorService();
export type { GeneratedDocument, DocumentSection };

