import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Tender, TenderData, AIAnalysis, Proposal } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tenders.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ tenders: [] }, null, 2));
}

function readData(): TenderData {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { tenders: [] };
  }
}

function writeData(data: TenderData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// AI Analysis Logic
function analyzeRequirements(tender: Tender): AIAnalysis {
  const keywords: Record<string, string[]> = {
    ai: ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network'],
    software: ['software', 'application', 'system', 'platform', 'development'],
    web: ['web', 'website', 'portal', 'dashboard', 'frontend', 'backend'],
    mobile: ['mobile', 'app', 'ios', 'android', 'react native'],
    cloud: ['cloud', 'aws', 'azure', 'gcp', 'infrastructure'],
    data: ['data', 'analytics', 'database', 'big data', 'visualization'],
    security: ['security', 'encryption', 'authentication', 'compliance'],
    integration: ['integration', 'api', 'rest', 'graphql', 'microservices']
  };

  const text = `${tender.title} ${tender.description} ${tender.scopeOfWork} ${tender.technicalRequirements} ${tender.functionalRequirements}`.toLowerCase();
  
  let matchScore = 0;
  const matchedCategories: string[] = [];
  
  Object.entries(keywords).forEach(([category, words]) => {
    const matches = words.filter(word => text.includes(word));
    if (matches.length > 0) {
      matchScore += matches.length * 10;
      matchedCategories.push(category);
    }
  });

  // Calculate scores
  const relevanceScore = Math.min(matchScore, 95);
  const feasibilityScore = Math.min(relevanceScore + Math.floor(Math.random() * 10), 95);
  const overallScore = Math.floor((relevanceScore + feasibilityScore) / 2);

  // Determine delivery capability
  let canDeliver, partialDeliver, outOfScope;
  
  if (overallScore >= 80) {
    canDeliver = 85 + Math.floor(Math.random() * 10);
    partialDeliver = 15 - Math.floor(Math.random() * 10);
  } else if (overallScore >= 60) {
    canDeliver = 60 + Math.floor(Math.random() * 15);
    partialDeliver = 25 + Math.floor(Math.random() * 10);
  } else {
    canDeliver = 40 + Math.floor(Math.random() * 15);
    partialDeliver = 30 + Math.floor(Math.random() * 15);
  }
  outOfScope = 100 - canDeliver - partialDeliver;

  // Generate gaps, risks, and assumptions
  const gaps = [];
  const risks = [];
  const assumptions = [];

  if (!matchedCategories.includes('security')) {
    gaps.push('Security requirements need clarification');
  }
  if (!matchedCategories.includes('cloud')) {
    gaps.push('Infrastructure and hosting details not specified');
  }
  if (text.includes('integration') && !text.includes('api')) {
    gaps.push('Integration specifications require more detail');
  }

  if (overallScore < 70) {
    risks.push('Some requirements may be outside core competency');
  }
  if (text.includes('deadline') || text.includes('urgent')) {
    risks.push('Tight timeline may impact delivery quality');
  }
  risks.push('Third-party dependencies may affect timeline');

  assumptions.push('Client will provide timely feedback and approvals');
  assumptions.push('All necessary access and credentials will be provided');
  assumptions.push('Requirements are stable and changes will follow change management process');

  return {
    status: 'completed',
    relevanceScore,
    feasibilityScore,
    overallScore,
    canDeliver,
    partialDeliver,
    outOfScope,
    gaps: gaps.length > 0 ? gaps : ['No significant gaps identified'],
    risks,
    assumptions,
    completedAt: new Date().toISOString()
  };
}

function generateProposal(tender: Tender, analysis: AIAnalysis): Proposal {
  const executiveSummary = `Neural Arc Inc is pleased to submit this proposal for "${tender.title}". With our extensive experience in AI-driven solutions and software development, we are confident in delivering a solution that meets your requirements. Our analysis indicates a ${analysis.overallScore}% alignment with your needs, and we are committed to addressing all aspects of this project with excellence.`;

  const requirementsUnderstanding = `Based on our thorough review of the tender documentation, we understand that you require:\n\n${tender.scopeOfWork}\n\nKey Technical Requirements:\n${tender.technicalRequirements}\n\nFunctional Requirements:\n${tender.functionalRequirements}\n\nWe have carefully analyzed these requirements and are prepared to deliver a comprehensive solution.`;

  const technicalApproach = `Our proposed technical approach leverages industry best practices and cutting-edge technologies:\n\n1. **Architecture Design**: We will implement a scalable, modular architecture that ensures maintainability and future extensibility.\n\n2. **Technology Stack**: Based on the requirements, we recommend using modern frameworks and tools that align with your technical specifications.\n\n3. **Development Methodology**: We follow Agile methodologies with bi-weekly sprints, ensuring continuous delivery and stakeholder engagement.\n\n4. **Quality Assurance**: Comprehensive testing strategy including unit tests, integration tests, and user acceptance testing.\n\n5. **Security**: Implementation of industry-standard security practices including encryption, authentication, and regular security audits.`;

  const scopeCoverage = `Based on our analysis:\n\n✓ **Fully Deliverable (${analysis.canDeliver}%)**: Core requirements including ${tender.title.toLowerCase()} functionality, user management, and primary features.\n\n⚠ **Partially Deliverable (${analysis.partialDeliver}%)**: Advanced features that may require additional clarification or phased implementation.\n\n✗ **Out of Scope (${analysis.outOfScope}%)**: Items requiring specialized expertise or third-party services not included in base proposal.`;

  const exclusions = `The following items are excluded from this proposal unless explicitly agreed upon:\n\n• Third-party licensing costs\n• Hardware procurement\n• Post-deployment maintenance beyond warranty period\n• Training beyond initial knowledge transfer sessions\n• Data migration from legacy systems (unless specified)`;

  const assumptionsText = `This proposal is based on the following assumptions:\n\n${analysis.assumptions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;

  const timeline = `**Proposed Timeline**:\n\nPhase 1 - Requirements & Design (2-3 weeks)\nPhase 2 - Development & Testing (6-8 weeks)\nPhase 3 - Deployment & Training (1-2 weeks)\nPhase 4 - Warranty & Support (3 months)\n\nTotal estimated duration: 10-14 weeks from project kickoff`;

  return {
    status: 'draft',
    executiveSummary,
    requirementsUnderstanding,
    technicalApproach,
    scopeCoverage,
    exclusions,
    assumptions: assumptionsText,
    timeline,
    commercialDetails: '',
    documents: [],
    submittedAt: null,
    reviewedAt: null,
    feedback: ''
  };
}

// Service Methods
export const tenderService = {
  getAll: () => {
    const data = readData();
    const now = Date.now();
    let updated = false;

    // Lazy AI Analysis Simulation
    data.tenders = data.tenders.map(tender => {
      const createdAt = new Date(tender.createdAt).getTime();
      const diff = now - createdAt;

      if (tender.aiAnalysis.status === 'pending' && diff > 1000) {
        tender.aiAnalysis.status = 'analyzing';
        updated = true;
      } else if (tender.aiAnalysis.status === 'analyzing' && diff > 6000) {
        tender.aiAnalysis = analyzeRequirements(tender);
        tender.proposal = generateProposal(tender, tender.aiAnalysis);
        updated = true;
      }
      return tender;
    });

    if (updated) {
      writeData(data);
    }

    return data.tenders;
  },

  getById: (id: string) => {
    const tenders = tenderService.getAll(); // Triggers lazy update
    return tenders.find(t => t.id === id);
  },

  create: (tenderData: Omit<Tender, 'id' | 'status' | 'createdAt' | 'createdBy' | 'aiAnalysis' | 'proposal'>) => {
    const data = readData();
    
    const newTender: Tender = {
      id: uuidv4(),
      ...tenderData,
      status: 'open',
      createdAt: new Date().toISOString(),
      createdBy: 'client',
      aiAnalysis: {
        status: 'pending',
        relevanceScore: 0,
        feasibilityScore: 0,
        overallScore: 0,
        canDeliver: 0,
        partialDeliver: 0,
        outOfScope: 0,
        gaps: [],
        risks: [],
        assumptions: [],
        completedAt: null
      },
      proposal: {
        status: 'draft',
        executiveSummary: '',
        requirementsUnderstanding: '',
        technicalApproach: '',
        scopeCoverage: '',
        exclusions: '',
        assumptions: '',
        timeline: '',
        commercialDetails: '',
        documents: [],
        submittedAt: null,
        reviewedAt: null,
        feedback: ''
      }
    };
    
    data.tenders.push(newTender);
    writeData(data);
    return newTender;
  },

  updateProposal: (id: string, proposalData: Partial<Proposal>) => {
    const data = readData();
    const tender = data.tenders.find(t => t.id === id);
    if (!tender) return null;

    tender.proposal = {
      ...tender.proposal,
      ...proposalData,
      status: 'draft' // Always revert to draft on edit unless explicit submit
    };

    writeData(data);
    return tender;
  },

  submitProposal: (id: string) => {
    const data = readData();
    const tender = data.tenders.find(t => t.id === id);
    if (!tender) return null;

    tender.proposal.status = 'submitted';
    tender.proposal.submittedAt = new Date().toISOString();

    writeData(data);
    return tender;
  },

  reviewProposal: (id: string, status: 'accepted' | 'rejected', feedback: string) => {
    const data = readData();
    const tender = data.tenders.find(t => t.id === id);
    if (!tender) return null;

    tender.proposal.status = status;
    tender.proposal.reviewedAt = new Date().toISOString();
    tender.proposal.feedback = feedback || '';

    writeData(data);
    return tender;
  },

  saveFile: async (file: File) => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);
    
    fs.writeFileSync(filePath, buffer);
    
    return {
      name: file.name,
      url: `/api/uploads/${uniqueName}`, // Route we will create
      size: file.size
    };
  },

  getFilePath: (filename: string) => {
    return path.join(UPLOADS_DIR, filename);
  }
};

