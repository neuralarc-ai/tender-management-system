import { Tender } from '@/types';

/**
 * Generate a professional HTML website from proposal text
 * This creates an instant website without waiting for AI to generate HTML
 */
export function generateProposalWebsite(tender: Tender): string {
  const proposal = tender.proposal;
  const aiScore = tender.aiAnalysis?.overallScore || 0;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tender.title} - Neural Arc Proposal</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.8;
      color: #1f2937;
      background: linear-gradient(135deg, #f5f3ff 0%, #fef3c7 100%);
    }
    .container { max-width: 1200px; margin: 0 auto; }
    
    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      opacity: 0.3;
    }
    .hero-content { position: relative; z-index: 1; }
    .logo { font-size: 42px; font-weight: 900; margin-bottom: 20px; letter-spacing: -1px; }
    .hero h1 { font-size: 48px; font-weight: 800; margin: 30px 0 20px; line-height: 1.2; }
    .hero p { font-size: 20px; opacity: 0.9; max-width: 800px; margin: 0 auto; }
    .badges { display: flex; gap: 15px; justify-content: center; margin-top: 30px; flex-wrap: wrap; }
    .badge {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      padding: 12px 24px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 700;
      border: 1px solid rgba(255,255,255,0.3);
    }
    
    /* Content Sections */
    .section { padding: 80px 40px; }
    .section-alt { background: white; }
    .section h2 {
      font-size: 36px;
      font-weight: 800;
      color: #4f46e5;
      margin-bottom: 30px;
      text-align: center;
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      margin: 30px auto;
      max-width: 900px;
    }
    .card h3 {
      font-size: 24px;
      color: #4f46e5;
      margin-bottom: 20px;
      font-weight: 700;
    }
    .card p, .card pre {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 15px;
      white-space: pre-wrap;
      line-height: 1.8;
    }
    
    /* Footer */
    .footer {
      background: #1f2937;
      color: white;
      padding: 60px 40px;
      text-align: center;
    }
    .footer-content { max-width: 800px; margin: 0 auto; }
    .portfolio-links {
      display: flex;
      gap: 30px;
      justify-content: center;
      margin: 30px 0;
      flex-wrap: wrap;
    }
    .portfolio-link {
      background: rgba(255,255,255,0.1);
      padding: 15px 30px;
      border-radius: 12px;
      text-decoration: none;
      color: white;
      font-weight: 600;
      transition: all 0.3s;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .portfolio-link:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-2px);
    }
    
    @media (max-width: 768px) {
      .hero h1 { font-size: 32px; }
      .section { padding: 40px 20px; }
      .card { padding: 25px; }
    }
    
    @media print {
      body { background: white; }
      .hero { background: #667eea; }
      .section { padding: 40px 20px; }
      .footer { page-break-before: always; }
    }
  </style>
</head>
<body>
  <!-- Hero Section -->
  <div class="hero">
    <div class="hero-content">
      <div class="logo">NEURAL ARC</div>
      <h1>${tender.title}</h1>
      <p>Professional Proposal for ${tender.createdBy === 'dcs' ? 'DCS Corporation' : 'Valued Client'}</p>
      <div class="badges">
        <span class="badge">🎯 ${aiScore}% AI Match</span>
        <span class="badge">🤖 AI-Powered Analysis</span>
        <span class="badge">⚡ ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </div>
  </div>

  <!-- Executive Summary -->
  <div class="section section-alt">
    <div class="container">
      <h2>Executive Summary</h2>
      <div class="card">
        <p>${proposal.executiveSummary || 'Neural Arc Inc is pleased to present this comprehensive proposal.'}</p>
      </div>
    </div>
  </div>

  <!-- Requirements Understanding -->
  <div class="section">
    <div class="container">
      <h2>Requirements Understanding</h2>
      <div class="card">
        <p>${proposal.requirementsUnderstanding || tender.scopeOfWork}</p>
      </div>
    </div>
  </div>

  <!-- Technical Approach -->
  <div class="section section-alt">
    <div class="container">
      <h2>Technical Approach</h2>
      <div class="card">
        <pre>${proposal.technicalApproach || 'Comprehensive technical approach with modern architecture.'}</pre>
      </div>
    </div>
  </div>

  <!-- Scope Coverage -->
  <div class="section">
    <div class="container">
      <h2>Scope & Deliverables</h2>
      <div class="card">
        <p>${proposal.scopeCoverage || `✓ Fully Deliverable: ${tender.aiAnalysis?.canDeliver}%\\n⚠ Partial: ${tender.aiAnalysis?.partialDeliver}%`}</p>
      </div>
    </div>
  </div>

  <!-- Timeline -->
  <div class="section section-alt">
    <div class="container">
      <h2>Delivery Timeline</h2>
      <div class="card">
        <pre>${proposal.timeline || 'Phase 1: Requirements (2-3w)\\nPhase 2: Development (6-8w)\\nPhase 3: Deployment (2w)'}</pre>
      </div>
    </div>
  </div>

  <!-- Commercial Details -->
  <div class="section">
    <div class="container">
      <h2>Investment & Terms</h2>
      <div class="card">
        <pre>${proposal.commercialDetails || 'Investment Range: $180,000 - $280,000'}</pre>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-content">
      <div class="logo">NEURAL ARC INC.</div>
      <p style="margin: 20px 0; opacity: 0.8;">AI-Driven Solutions & Software Development Excellence</p>
      
      <div class="portfolio-links">
        <a href="https://ipc.he2.ai" target="_blank" class="portfolio-link">
          📱 ipc.he2.ai - IPC System Proposal
        </a>
        <a href="https://ers.he2.ai" target="_blank" class="portfolio-link">
          🏢 ers.he2.ai - ERES Framework Proposal
        </a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; opacity: 0.7;">
        Contact: admin@neuralarc.com | This proposal is confidential
      </p>
    </div>
  </div>
</body>
</html>`;
}


