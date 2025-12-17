const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Ensure directories exist
const dirs = ['data', 'uploads'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Data storage
const DATA_FILE = 'data/tenders.json';

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ tenders: [] }, null, 2));
}

// Helper functions
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { tenders: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// AI Analysis Engine
function analyzeRequirements(tender) {
  const keywords = {
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
  let matchedCategories = [];
  
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
    outOfScope = 100 - canDeliver - partialDeliver;
  } else if (overallScore >= 60) {
    canDeliver = 60 + Math.floor(Math.random() * 15);
    partialDeliver = 25 + Math.floor(Math.random() * 10);
    outOfScope = 100 - canDeliver - partialDeliver;
  } else {
    canDeliver = 40 + Math.floor(Math.random() * 15);
    partialDeliver = 30 + Math.floor(Math.random() * 15);
    outOfScope = 100 - canDeliver - partialDeliver;
  }

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

// Proposal Generation Engine
function generateProposal(tender, analysis) {
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

// API Routes

// Get all tenders
app.get('/api/tenders', (req, res) => {
  const data = readData();
  res.json(data.tenders);
});

// Get single tender
app.get('/api/tenders/:id', (req, res) => {
  const data = readData();
  const tender = data.tenders.find(t => t.id === req.params.id);
  
  if (!tender) {
    return res.status(404).json({ error: 'Tender not found' });
  }
  
  res.json(tender);
});

// Create new tender
app.post('/api/tenders', (req, res) => {
  const data = readData();
  
  const newTender = {
    id: uuidv4(),
    ...req.body,
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
  
  // Trigger AI analysis after a short delay
  setTimeout(() => {
    triggerAIAnalysis(newTender.id);
  }, 1000);
  
  res.status(201).json(newTender);
});

// Trigger AI analysis
function triggerAIAnalysis(tenderId) {
  const data = readData();
  const tender = data.tenders.find(t => t.id === tenderId);
  
  if (!tender) return;
  
  // Set status to analyzing
  tender.aiAnalysis.status = 'analyzing';
  writeData(data);
  
  // Simulate AI processing time (5-10 seconds for demo, represents 5-10 minutes)
  const processingTime = 5000 + Math.random() * 5000;
  
  setTimeout(() => {
    const data = readData();
    const tender = data.tenders.find(t => t.id === tenderId);
    
    if (!tender) return;
    
    // Perform analysis
    tender.aiAnalysis = analyzeRequirements(tender);
    
    // Generate proposal draft
    tender.proposal = generateProposal(tender, tender.aiAnalysis);
    
    writeData(data);
  }, processingTime);
}

// Manual trigger for AI analysis
app.post('/api/tenders/:id/analyze', (req, res) => {
  const data = readData();
  const tender = data.tenders.find(t => t.id === req.params.id);
  
  if (!tender) {
    return res.status(404).json({ error: 'Tender not found' });
  }
  
  triggerAIAnalysis(tender.id);
  res.json({ message: 'AI analysis triggered' });
});

// Update proposal
app.put('/api/tenders/:id/proposal', (req, res) => {
  const data = readData();
  const tender = data.tenders.find(t => t.id === req.params.id);
  
  if (!tender) {
    return res.status(404).json({ error: 'Tender not found' });
  }
  
  tender.proposal = {
    ...tender.proposal,
    ...req.body,
    status: 'draft'
  };
  
  writeData(data);
  res.json(tender);
});

// Submit proposal
app.post('/api/tenders/:id/proposal/submit', (req, res) => {
  const data = readData();
  const tender = data.tenders.find(t => t.id === req.params.id);
  
  if (!tender) {
    return res.status(404).json({ error: 'Tender not found' });
  }
  
  tender.proposal.status = 'submitted';
  tender.proposal.submittedAt = new Date().toISOString();
  
  writeData(data);
  res.json(tender);
});

// Update proposal status (client review)
app.put('/api/tenders/:id/proposal/review', (req, res) => {
  const data = readData();
  const tender = data.tenders.find(t => t.id === req.params.id);
  
  if (!tender) {
    return res.status(404).json({ error: 'Tender not found' });
  }
  
  tender.proposal.status = req.body.status;
  tender.proposal.reviewedAt = new Date().toISOString();
  tender.proposal.feedback = req.body.feedback || '';
  
  writeData(data);
  res.json(tender);
});

// File upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    name: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    size: req.file.size
  });
});

// Serve portals
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tender Management System running on http://localhost:${PORT}`);
  console.log(`📋 Client Portal: http://localhost:${PORT}/client`);
  console.log(`⚙️  Admin Portal: http://localhost:${PORT}/admin`);
});