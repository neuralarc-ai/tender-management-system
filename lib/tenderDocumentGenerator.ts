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
        model: 'gemini-3-pro-preview'
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
    
    const rfqNumber = `RFQ-${Date.now().toString().slice(-8)}`;
    const currentMonth = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });

    const techReqs = tender.technical_requirements || tender.technicalRequirements || 'Standard technical requirements';
    const funcReqs = tender.functional_requirements || tender.functionalRequirements || 'Standard functional requirements';
    const scope = tender.scope_of_work || tender.scopeOfWork || 'As specified in RFQ';
    const budget = tender.budget || 'To be discussed';

    return `You are a professional proposal writer for Neural Arc Inc, a leading generative AI consultancy. Create a comprehensive, professionally formatted business proposal document.

CONTEXT:
Project Title: ${tender.title}
Project Description: ${tender.description || 'Enterprise AI Solution'}
RFQ Reference: ${rfqNumber}
Submission Deadline: ${deadline}
Budget Range: ${budget}

Technical Requirements:
${techReqs}

Functional Requirements:
${funcReqs}

Scope of Work:
${scope}

==============================================
DOCUMENT STRUCTURE & REQUIREMENTS:
==============================================

Generate a COMPLETE, WELL-FORMATTED professional proposal with the following sections. Each section must be fully written with proper paragraph structure, correct spelling, grammar, and professional business language.

---------------------------------------------------
SECTION 1: COVER PAGE
---------------------------------------------------

Format exactly as:

NEURAL ARC INC
Pioneering Generative AI Solutions for Enterprise Excellence

[3 blank lines]

${tender.title}
Technical Proposal & Implementation Plan

[2 blank lines]

Reference: ${rfqNumber}
Date: ${currentMonth}

[2 blank lines]

Submitted To: [Client Organization]
Submitted By: Neural Arc Inc
Contact: Aniket Tapre, Founder
Email: contact@neuralarc.ai
Website: www.neuralarc.ai

---------------------------------------------------
SECTION 2: EXECUTIVE SUMMARY
---------------------------------------------------

Write a compelling 3-4 paragraph executive summary that:
- Introduces Neural Arc and our core competencies in generative AI
- Summarizes the project opportunity and why we're the ideal partner
- Highlights our unique value proposition
- Provides key project parameters (timeline, approach, outcomes)

Use professional business language with proper paragraph formatting.

---------------------------------------------------
SECTION 3: ABOUT NEURAL ARC
---------------------------------------------------

3.1 Who We Are

Write 3-4 comprehensive paragraphs describing:
- Neural Arc as a specialized AI/ML consultancy founded by industry experts
- Our mission to make generative AI accessible and transformative for enterprises
- Our team composition: AI engineers, data scientists, ML architects, software developers
- Our focus on practical, scalable AI solutions that deliver measurable business value

3.2 Our Generative AI Expertise

Write 2-3 paragraphs explaining:
- Our specialization in large language models, computer vision, and intelligent automation
- How we help organizations leverage AI for competitive advantage
- Our methodology for responsible AI implementation with focus on ethics and governance

3.3 Core Capabilities

Create a properly formatted table:

Domain                          | Capabilities & Solutions
------------------------------- | ------------------------------------------------------------
Natural Language Processing     | Conversational AI, Document Intelligence, Content Generation,
                                 | Semantic Search, Sentiment Analysis, Translation Services
Intelligent Automation          | Workflow Orchestration, Process Mining, Intelligent RPA,
                                 | Decision Automation, Business Process Optimization  
Predictive Analytics           | Demand Forecasting, Risk Assessment, Anomaly Detection,
                                 | Performance Optimization, Predictive Maintenance
Computer Vision                | Document Analysis, Object Recognition, Quality Inspection,
                                 | Visual Search, Image Classification
Data Engineering               | Data Pipeline Design, ETL/ELT Development, Data Lake
                                 | Architecture, Real-time Processing, Data Governance

3.4 Our Track Record

Write 2-3 paragraphs about:
- Successful AI implementations across healthcare, finance, government, retail
- Types of solutions delivered (chatbots, document processing, predictive systems)
- Client satisfaction and project success rates

Include statistics in a formatted box:

[Statistics Box]
✓ 8+ Successful AI Projects Delivered
✓ 6 Active Enterprise Implementations  
✓ 5 Global Markets Served
✓ 100% Client Satisfaction Rate
✓ 98% Average Model Accuracy
✓ 50+ AI Models Deployed in Production

---------------------------------------------------
SECTION 4: UNDERSTANDING YOUR REQUIREMENTS
---------------------------------------------------

4.1 Project Context

Write 3-4 paragraphs demonstrating understanding of:
- The business problem or opportunity this project addresses
- Why this project is important to the organization
- Key challenges and success factors
- Our interpretation of the RFQ requirements

4.2 Your Requirements - Our Understanding

Technical Requirements Analysis:
Write detailed paragraphs analyzing each technical requirement and how we interpret it.

Functional Requirements Analysis:
Write detailed paragraphs analyzing each functional requirement and what it means for the solution.

4.3 Success Criteria

List 5-7 measurable success criteria for the project, such as:
- System performance metrics
- User adoption targets  
- Business KPIs
- Quality standards
- Security compliance

---------------------------------------------------
SECTION 5: OUR PROPOSED SOLUTION
---------------------------------------------------

5.1 Solution Overview

Write 3-4 paragraphs providing:
- High-level description of our proposed solution architecture
- How it addresses all stated requirements
- Key technological components and frameworks
- Integration approach with existing systems

5.2 Technical Architecture

Create a detailed architecture description including:

System Components:
- Frontend Layer: [Describe user interface and experience]
- Application Layer: [Describe business logic and services]
- Data Layer: [Describe database and storage]
- Integration Layer: [Describe APIs and connections]
- AI/ML Layer: [Describe AI models and capabilities]

Technology Stack:
Write comprehensive paragraphs about:
- Programming languages and frameworks we'll use (Python, TypeScript, React, etc.)
- Cloud infrastructure (AWS/Azure/GCP)
- Databases and data stores
- AI/ML frameworks (TensorFlow, PyTorch, Gemini, etc.)
- DevOps and monitoring tools

5.3 Security & Compliance

Write 3-4 paragraphs covering:
- Data encryption (at rest and in transit)
- Authentication and authorization (OAuth 2.0, JWT, RBAC)
- Audit logging and monitoring
- Compliance standards (GDPR, SOC 2, ISO 27001)
- Security testing and vulnerability management

5.4 Scalability & Performance

Write 2-3 paragraphs about:
- How the system will scale to handle growth
- Performance optimization strategies
- Load balancing and redundancy
- Target performance metrics (uptime, response times)

---------------------------------------------------
SECTION 6: IMPLEMENTATION APPROACH
---------------------------------------------------

6.1 Our Methodology

Write 3-4 paragraphs describing:
- Agile development approach with 2-week sprints
- Continuous integration and deployment practices
- Quality assurance and testing strategy
- Risk management and mitigation
- Communication and reporting cadence

6.2 Project Phases

Create a detailed timeline table:

Phase      | Duration | Key Activities                           | Deliverables
---------- | -------- | ---------------------------------------- | ---------------------------
Discovery  | Week 1-2 | Requirements analysis, Technical design, | Requirements document,
& Planning |          | Architecture planning, Project setup     | Technical specification,
           |          |                                          | Project plan
---------------------------------------------------------------------------
Design &   | Week 3-4 | System architecture, Database design,    | Architecture diagrams,
Architecture|         | API specifications, UI/UX design         | Design mockups,
           |          |                                          | API documentation
---------------------------------------------------------------------------
Development| Week     | Sprint-based development, Feature        | Working system modules,
Phase 1    | 5-8      | implementation, Unit testing             | Code repositories,
           |          |                                          | Test reports
---------------------------------------------------------------------------
Development| Week     | Advanced features, System integration,   | Integrated system,
Phase 2    | 9-12     | Performance optimization                 | Integration tests
---------------------------------------------------------------------------
Testing &  | Week     | UAT, Performance testing, Security       | Test reports, Bug fixes,
QA         | 13-14    | testing, Bug fixing                      | UAT sign-off
---------------------------------------------------------------------------
Deployment | Week     | Production deployment, Data migration,   | Live system,
& Go-Live  | 15-16    | Training, Documentation, Go-live support | Training materials,
           |          |                                          | Support documentation

6.3 Team Structure

Create team table:

Role                    | Responsibilities                    | Allocation
----------------------- | ----------------------------------- | -----------
Project Manager        | Overall coordination, Client comms  | 50%
Solution Architect     | Technical design, Code reviews      | 75%
Senior AI/ML Engineer  | AI model development, Training      | 100%
Full-Stack Developers  | Feature development, Integration    | 200% (2 devs)
QA Engineer           | Testing, Quality assurance          | 75%
DevOps Engineer       | Infrastructure, Deployment          | 50%
UI/UX Designer        | Interface design, User experience   | 25%

---------------------------------------------------
SECTION 7: COMMERCIAL PROPOSAL
---------------------------------------------------

7.1 Pricing Philosophy

Write 2-3 paragraphs about:
- Our transparent, value-based pricing approach
- How we calculate costs based on effort, expertise, and value delivered
- Our commitment to competitive pricing with no hidden fees

7.2 Cost Breakdown

Create detailed cost table:

Cost Component              | Description                        | Amount (USD)
--------------------------- | ---------------------------------- | ------------
Professional Services       | Development, Design, Architecture  | [Calculate]
AI/ML Development          | Model training, Integration        | [Calculate]
Project Management         | Coordination, Reporting            | [Calculate]
Quality Assurance          | Testing, QA processes              | [Calculate]
Infrastructure Setup       | Cloud setup, DevOps                | [Calculate]
Documentation & Training   | User guides, Training sessions     | [Calculate]
Post-Launch Support (3mo)  | Bug fixes, Optimization            | [Calculate]
--------------------------- | ---------------------------------- | ------------
TOTAL PROJECT INVESTMENT   |                                    | [Total]

7.3 Payment Schedule

Create payment milestone table:

Milestone  | Deliverable                    | Payment | Timeline
---------- | ------------------------------ | ------- | ----------
Milestone 1| Project Kickoff & Design       | 25%     | Week 2
Milestone 2| Development Phase 1 Complete   | 25%     | Week 8  
Milestone 3| Development Phase 2 Complete   | 25%     | Week 12
Milestone 4| UAT Sign-off & Go-Live        | 20%     | Week 16
Milestone 5| Post-Launch Support Complete   | 5%      | Week 28

---------------------------------------------------
SECTION 8: WHY CHOOSE NEURAL ARC
---------------------------------------------------

Write 4-5 comprehensive paragraphs covering:

8.1 Our Competitive Advantages
- Deep AI/ML expertise with proven track record
- Agile, collaborative approach to development
- Focus on practical, business-value-driven solutions
- Strong emphasis on security and compliance
- Transparent communication and partnership mindset

8.2 What Sets Us Apart
- Specialized generative AI capabilities
- End-to-end solution delivery (not just consulting)
- Experienced team with enterprise project experience
- Commitment to knowledge transfer and client enablement
- Ongoing support and continuous improvement

8.3 Client Success Stories
- Brief examples of similar projects we've delivered
- Measurable outcomes and client testimonials
- Industries and use cases

---------------------------------------------------
SECTION 9: TERMS & CONDITIONS
---------------------------------------------------

9.1 Assumptions

List key assumptions including:
- Client will provide timely feedback and approvals
- Required access to systems and data will be granted
- Subject matter experts will be available for consultation
- Infrastructure and licenses will be provided as needed

9.2 Warranty & Support

Write 1-2 paragraphs about:
- 90-day warranty period for bug fixes
- 3 months of post-launch support included
- Available extended support and maintenance packages

9.3 Intellectual Property

Write 1-2 paragraphs clarifying:
- Client owns all deliverables upon final payment
- Neural Arc retains ownership of pre-existing IP and frameworks
- Licensing arrangements for third-party components

---------------------------------------------------
SECTION 10: CONCLUSION & NEXT STEPS
---------------------------------------------------

Write 3-4 compelling paragraphs that:
- Reiterate our enthusiasm for this opportunity
- Summarize why Neural Arc is the ideal partner
- Express confidence in delivering exceptional results
- Outline immediate next steps if proposal is accepted

Next Steps:
1. Proposal review and feedback
2. Clarification meeting (if needed)
3. Contract negotiation and signing
4. Project kickoff within 1 week of contract execution

---------------------------------------------------
CONTACT INFORMATION
---------------------------------------------------

For questions, clarifications, or to discuss this proposal:

Neural Arc Inc
Email: contact@neuralarc.ai
Website: www.neuralarc.ai
Phone: +971 [Contact Number]

Primary Contact:
Aniket Tapre
Founder & CEO, Neural Arc Inc
Email: aniket@neuralarc.ai

---------------------------------------------------
CLOSING
---------------------------------------------------

Thank you for considering Neural Arc Inc for this important project. We are excited about the opportunity to partner with you and deliver a world-class AI solution that drives measurable business value.

We look forward to discussing this proposal and answering any questions you may have.

Sincerely,

Aniket Tapre
Founder & CEO
Neural Arc Inc

---------------------------------------------------

© ${new Date().getFullYear()} Neural Arc Inc. All rights reserved.
This proposal is confidential and proprietary.
Valid for 90 days from ${currentMonth}.
Reference: ${rfqNumber}

==============================================
CRITICAL FORMATTING REQUIREMENTS:
==============================================

1. Write COMPLETE, FULL-LENGTH paragraphs (minimum 3-4 sentences each)
2. Use proper business English with correct spelling and grammar
3. Format tables with clear borders using | and - characters
4. Use proper spacing between sections (2-3 blank lines)
5. Maintain consistent indentation and alignment
6. NO markdown symbols (asterisks, hashes, backticks)
7. Write in third person professional voice
8. Minimum 5000 words total
9. All sections must be fully expanded with substantial content
10. Use proper headings with section numbers
11. Include proper line breaks between paragraphs
12. Format lists with clear bullet points or numbers
13. Ensure all tables are aligned and properly formatted
14. Double-check spelling, especially: Neural Arc, Aniket Tapre
15. Use "we" and "our" when referring to Neural Arc
16. Make it ready for immediate client submission

Generate the complete, professionally formatted proposal document now:`;
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

