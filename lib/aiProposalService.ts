/**
 * AI Proposal Generation Service using Helium Public API
 * Documentation: COMPREHENSIVE_API_DOCUMENTATION.md
 */

const AI_API_KEY = process.env.AI_API_KEY!;
const API_BASE_URL = process.env.AI_API_ENDPOINT || 'https://api.he2.site/api/v1/public';

if (!AI_API_KEY) {
  console.error('⚠️ AI_API_KEY not found in environment variables. Please add to .env.local');
  throw new Error('AI_API_KEY is required');
}

interface ProposalGenerationRequest {
  tenderTitle: string;
  tenderDescription: string;
  scopeOfWork: string;
  technicalRequirements: string;
  functionalRequirements: string;
  documents?: Array<{ name: string; url: string; content?: string }>;
}

export async function generateProposalWithAI(request: ProposalGenerationRequest) {
  try {
    console.log(`🤖 Starting AI proposal generation for: ${request.tenderTitle}`);

    // Step 1: Create quick-action task
    const prompt = buildProposalPrompt(request);
    
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('source', 'tender-management-system');
    formData.append('enable_thinking', 'true');
    formData.append('reasoning_effort', 'high');
    
    // Attach documents if available
    if (request.documents && request.documents.length > 0) {
      for (const doc of request.documents) {
        if (doc.url && doc.url.startsWith('http')) {
          // In production, download and attach file
          console.log(`📎 Would attach document: ${doc.name}`);
        }
      }
    }

    console.log('📤 Sending request to Helium API...');
    
    const quickActionResponse = await fetch(`${API_BASE_URL}/quick-action`, {
      method: 'POST',
      headers: {
        'X-API-Key': AI_API_KEY
      },
      body: formData
    });

    if (!quickActionResponse.ok) {
      const error = await quickActionResponse.text();
      console.error('❌ Helium API Error:', error);
      throw new Error(`API request failed: ${quickActionResponse.status}`);
    }

    const quickActionData = await quickActionResponse.json();
    console.log('✅ Task created successfully');
    console.log(`📋 Thread ID: ${quickActionData.thread_id}`);
    console.log(`📋 Project ID: ${quickActionData.project_id}`);

    const { project_id, thread_id, agent_run_id } = quickActionData;

    // Step 2: ONLY poll for status - DO NOT send anything else
    console.log('⏳ Now polling for completion - will only CHECK status, not send anything...');
    
    let attempts = 0;
    let response: any = null;
    
    while (true) { // Infinite loop until completion
      attempts++;
      const elapsed = Math.floor((attempts * 10) / 60);
      console.log(`📡 Poll attempt ${attempts} (${elapsed} min) - checking status...`);
      
      try {
        // Use standard polling (NOT SSE) to get JSON response
        const responseUrl = `${API_BASE_URL}/threads/${thread_id}/response?project_id=${project_id}&timeout=30&include_file_content=true`;
        
        const responseData = await fetch(responseUrl, {
          method: 'GET',
          headers: {
            'X-API-Key': AI_API_KEY,
            'Accept': 'application/json' // Request JSON, not SSE
          }
        });

        if (responseData.ok) {
          const contentType = responseData.headers.get('content-type');
          
          // Handle different response types
          if (contentType?.includes('application/json')) {
            response = await responseData.json();
          } else if (contentType?.includes('text/event-stream')) {
            // If server sends SSE despite our request, parse it
            const text = await responseData.text();
            console.log('⚠️ Received SSE stream, parsing...');
            
            // Parse SSE format: "data: {...}\n\n"
            const lines = text.split('\n').filter(line => line.startsWith('data: '));
            if (lines.length > 0) {
              const lastDataLine = lines[lines.length - 1];
              const jsonStr = lastDataLine.substring(6); // Remove "data: " prefix
              response = JSON.parse(jsonStr);
            } else {
              console.log('⚠️ No data lines found in SSE response');
              await new Promise(resolve => setTimeout(resolve, 10000));
              continue;
            }
          } else {
            console.log(`⚠️ Unexpected content type: ${contentType}`);
            await new Promise(resolve => setTimeout(resolve, 10000));
            continue;
          }

          console.log(`📊 Response status: ${response.status}`);
          console.log(`📊 has_files: ${response.has_files || false}, files count: ${response.files?.length || 0}`);
          console.log(`📊 has_code: ${response.has_code || false}, code_blocks count: ${response.code_blocks?.length || 0}`);
          console.log(`📊 has response.response: ${!!response.response}, has content: ${!!response.response?.content}`);
          
          if (response.status === 'completed') {
            // AI completed - check where the content is
            const textContent = response.response?.content || response.content || response.message;
            const hasFiles = response.has_files && response.files && response.files.length > 0;
            const hasCodeBlocks = response.has_code && response.code_blocks && response.code_blocks.length > 0;
            
            if (textContent || hasFiles || hasCodeBlocks) {
              console.log(`✅ AI generation complete after ${elapsed} minutes!`);
              console.log(`📝 Text content: ${textContent ? textContent.length + ' chars' : 'none'}`);
              console.log(`📁 Files: ${response.files?.length || 0}`);
              console.log(`💻 Code blocks: ${response.code_blocks?.length || 0}`);
              
              // Ensure response structure exists
              if (!response.response) response.response = {};
              if (!response.response.content && textContent) response.response.content = textContent;
              
              break; // Exit loop - we have content
            } else {
              console.log(`⚠️ Status completed but no content/files/code found.`);
              console.log(`⚠️ Response keys:`, Object.keys(response));
              console.log(`⚠️ Continuing to poll in case content arrives...`);
              await new Promise(resolve => setTimeout(resolve, 10000));
            }
          } else if (response.status === 'failed') {
            console.error('⚠️ AI reported failed status, but continuing to poll anyway...');
            await new Promise(resolve => setTimeout(resolve, 10000));
          } else {
            // Still running
            console.log(`⏳ Status: ${response.status}, continuing...`);
            await new Promise(resolve => setTimeout(resolve, 10000));
          }
        } else {
          const errorText = await responseData.text();
          console.log(`⚠️ HTTP ${responseData.status}: ${errorText.substring(0, 200)}`);
          console.log(`⚠️ Retrying in 10s...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      } catch (error: any) {
        console.error(`⚠️ Poll attempt ${attempts} error:`, error.message);
        
        // Check if it's a parsing error
        if (error.message.includes('JSON') || error.message.includes('Unexpected token')) {
          console.log('⚠️ JSON parsing failed - API may be sending SSE format');
        }
        
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s on error, then continue
      }
    }
    
    if (response && response.status === 'completed') {
      console.log('✅ Processing completed response...');
      
      // Extract content from wherever it is
      let textContent = response.response?.content || response.content || response.message || '';
      
      // If we have code blocks, extract HTML from them
      if (response.has_code && response.code_blocks && response.code_blocks.length > 0) {
        console.log(`💻 Found ${response.code_blocks.length} code block(s)`);
        for (const block of response.code_blocks) {
          if (block.language === 'html' || block.file_path?.includes('.html')) {
            textContent += '\n\n' + block.code;
            console.log(`✅ Extracted HTML from code block: ${block.file_path || 'unnamed'}`);
          }
        }
      }
      
      // STEP 3: Fetch actual files from workspace
      console.log('📂 Fetching files from AI workspace...');
      
      // STEP 3: Fetch actual generated files from workspace
      console.log('📂 Fetching generated files from AI workspace...');
      
      const filesUrl = `${API_BASE_URL}/threads/${thread_id}/files?project_id=${project_id}`;
      const filesResponse = await fetch(filesUrl, {
        headers: { 'X-API-Key': AI_API_KEY }
      });
      
      let generatedFiles: any[] = [];
      let websiteHtml: string | null = null;
      let pdfContent: any = null;
      
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        console.log(`📁 Found ${filesData.files?.length || 0} file(s) in workspace`);
        
        if (filesData.files && filesData.files.length > 0) {
          // Download each file
          for (const file of filesData.files) {
            console.log(`⬇️ Downloading: ${file.file_name}`);
            
            const fileUrl = `${API_BASE_URL}/files/${encodeURIComponent(file.file_id)}?project_id=${project_id}&thread_id=${thread_id}`;
            const fileResponse = await fetch(fileUrl, {
              headers: { 'X-API-Key': AI_API_KEY }
            });
            
            if (fileResponse.ok) {
              const fileData = await fileResponse.json();
              
              if (fileData.file) {
                generatedFiles.push({
                  name: fileData.file.file_name,
                  content: fileData.file.content,
                  size: fileData.file.file_size,
                  type: fileData.file.file_type
                });
                
                // Check if it's the HTML website
                if (fileData.file.file_name.includes('.html') || fileData.file.file_type === 'text/html') {
                  websiteHtml = fileData.file.content;
                  console.log('✅ Found HTML website:', fileData.file.file_name);
                }
                
                // Check if it's PDF or markdown
                if (fileData.file.file_name.includes('.pdf') || fileData.file.file_name.includes('.md')) {
                  pdfContent = fileData.file.content;
                  console.log('✅ Found PDF/document:', fileData.file.file_name);
                }
              }
            }
          }
        }
      }
      
      // Parse text sections
      const proposalSections = parseAIResponse(response.response.content);
        
      return {
        ...proposalSections,
        generatedFiles,
        websiteHtml,
        pdfContent,
        metadata: {
          projectId: project_id,
          threadId: thread_id,
          agentRunId: agent_run_id,
          waitedSeconds: response.waited_seconds,
          hasWebsite: !!websiteHtml,
          hasPDF: !!pdfContent,
          fileCount: generatedFiles.length
        }
      };
    } else {
      throw new Error(`AI generation incomplete or failed: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Error generating proposal with AI:', error);
    throw error;
  }
}

function buildProposalPrompt(request: ProposalGenerationRequest): string {
  return `You are a professional web developer creating a proposal website for Neural Arc Inc.

# PROJECT
Title: ${request.tenderTitle}
Description: ${request.tenderDescription}
Scope: ${request.scopeOfWork}
Technical: ${request.technicalRequirements}
Functional: ${request.functionalRequirements}

${request.documents && request.documents.length > 0 ? `Attached Documents: ${request.documents.map(d => d.name).join(', ')}` : ''}

# TASK
Create a complete, professional single-page HTML website for this proposal.

DESIGN:
- Modern, responsive (inspired by ipc.he2.ai and ers.he2.ai)
- Indigo/purple gradients
- Glassmorphism effects
- Professional typography

SECTIONS TO INCLUDE:
1. Hero with Neural Arc branding and project title
2. Executive Summary (compelling introduction)
3. Requirements Understanding
4. Technical Approach (PDF + Website development capabilities)
5. Scope & Deliverables breakdown
6. Timeline with phases
7. Investment details ($180K-$280K range)
8. Portfolio links (ipc.he2.ai, ers.he2.ai)
9. Contact CTA

Create the HTML with inline CSS. Make it impressive, client-ready, and professional.`;
}

function parseAIResponse(aiResponse: string): {
  executiveSummary: string;
  requirementsUnderstanding: string;
  technicalApproach: string;
  scopeCoverage: string;
  timeline: string;
  commercialDetails: string;
  generatedFiles?: any[];
  websiteHtml?: string;
} {
  try {
    console.log('🔍 Parsing AI response (length:', aiResponse.length, 'chars)');
    
    // First, try to extract HTML code block
    const htmlMatch = aiResponse.match(/```html[:\s]*([\s\S]*?)```/i);
    let websiteHtml = null;
    
    if (htmlMatch && htmlMatch[1]) {
      websiteHtml = htmlMatch[1].trim();
      console.log('✅ Extracted HTML website (', websiteHtml.length, 'chars)');
    }

    // Extract proposal sections from markers or text
    const sections = {
      executiveSummary: extractSection(aiResponse, 'EXECUTIVE_SUMMARY') || extractSection(aiResponse, 'Executive Summary') || extractFromHTML(websiteHtml, 'executive'),
      requirementsUnderstanding: extractSection(aiResponse, 'REQUIREMENTS_UNDERSTANDING') || extractSection(aiResponse, 'Requirements') || extractFromHTML(websiteHtml, 'requirements'),
      technicalApproach: extractSection(aiResponse, 'TECHNICAL_APPROACH') || extractSection(aiResponse, 'Technical') || extractFromHTML(websiteHtml, 'technical'),
      scopeCoverage: extractSection(aiResponse, 'SCOPE_COVERAGE') || extractSection(aiResponse, 'Scope') || 'Full scope coverage analysis provided.',
      timeline: extractSection(aiResponse, 'TIMELINE') || extractSection(aiResponse, 'Timeline') || 'Timeline: 12-16 weeks across multiple phases.',
      commercialDetails: extractSection(aiResponse, 'COMMERCIAL') || extractSection(aiResponse, 'Investment') || 'Investment: $180,000 - $280,000',
      websiteHtml: websiteHtml || undefined
    };

    // Validate
    if (websiteHtml && websiteHtml.includes('<!DOCTYPE') && websiteHtml.includes('</html>')) {
      console.log('✅ Valid HTML website generated');
    } else if (!sections.executiveSummary || sections.executiveSummary.length < 100) {
      console.log('⚠️ Minimal content, using intelligent split...');
      throw new Error('Need fallback parsing');
    }

    console.log('✅ Successfully parsed proposal');
    return sections;
  } catch (error) {
    console.log('📝 Using intelligent fallback parsing...');
    
    // Fallback parsing
    const lines = aiResponse.split('\n');
    const paragraphs: string[] = [];
    let currentParagraph = '';
    
    for (const line of lines) {
      if (line.trim() === '') {
        if (currentParagraph.trim()) {
          paragraphs.push(currentParagraph.trim());
          currentParagraph = '';
        }
      } else {
        currentParagraph += line + '\n';
      }
    }
    if (currentParagraph.trim()) {
      paragraphs.push(currentParagraph.trim());
    }

    return {
      executiveSummary: paragraphs.slice(0, 3).join('\n\n') || aiResponse.substring(0, Math.min(1000, aiResponse.length)),
      requirementsUnderstanding: paragraphs.slice(3, 5).join('\n\n') || 'Requirements analysis provided.',
      technicalApproach: paragraphs.slice(5, 10).join('\n\n') || aiResponse,
      scopeCoverage: 'Comprehensive scope analysis. Please review complete proposal.',
      timeline: 'Phase 1 (2-3w), Phase 2 (6-8w), Phase 3 (2w). Total: 10-14 weeks.',
      commercialDetails: 'Investment: $150,000 - $300,000 based on requirements.'
    };
  }
}

function extractFromHTML(html: string | null, section: string): string {
  if (!html) return '';
  // Try to extract section from HTML
  const regex = new RegExp(`<section[^>]*id="${section}"[^>]*>([\s\S]*?)</section>`, 'i');
  const match = html.match(regex);
  return match ? match[1].replace(/<[^>]+>/g, '').trim() : '';
}

function extractSection(text: string, sectionName: string): string {
  const startMarker = `---${sectionName}---`;
  const endMarkers = ['---', '---END---'];
  
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) {
    // Try without dashes
    const altMarker = sectionName.replace(/_/g, ' ');
    const altIndex = text.toLowerCase().indexOf(altMarker.toLowerCase());
    if (altIndex !== -1) {
      // Extract next few paragraphs
      const remaining = text.substring(altIndex);
      const nextSection = remaining.indexOf('\n\n\n');
      return remaining.substring(0, nextSection > 0 ? nextSection : 500).trim();
    }
    return '';
  }

  const contentStart = startIndex + startMarker.length;
  let endIndex = text.length;

  // Find the next section marker
  for (const marker of endMarkers) {
    const markerIndex = text.indexOf(marker, contentStart);
    if (markerIndex !== -1 && markerIndex > contentStart && markerIndex < endIndex) {
      endIndex = markerIndex;
    }
  }

  return text.substring(contentStart, endIndex).trim();
}

/**
 * Generate proposal automatically when tender is created
 */
export async function autoGenerateProposal(tender: any, aiAnalysis: any) {
  try {
    console.log(`🤖 Auto-generating proposal for: ${tender.title}`);

    const proposalSections = await generateProposalWithAI({
      tenderTitle: tender.title,
      tenderDescription: tender.description,
      scopeOfWork: tender.scopeOfWork,
      technicalRequirements: tender.technicalRequirements,
      functionalRequirements: tender.functionalRequirements,
      documents: tender.documents || []
    });

    console.log('✅ AI proposal generated successfully');
    return proposalSections;

  } catch (error) {
    console.error('❌ AI proposal generation failed, using template fallback:', error);
    
    // Fallback to template-based proposal
    return generateFallbackProposal(tender, aiAnalysis);
  }
}

function generateFallbackProposal(tender: any, aiAnalysis: any) {
  return {
    executiveSummary: `Neural Arc Inc is pleased to submit this proposal for "${tender.title}". With our extensive experience demonstrated through projects like ipc.he2.ai and ers.he2.ai, we are confident in delivering both PDF generation systems and comprehensive web solutions. Our analysis indicates a ${aiAnalysis.overallScore}% alignment with your needs.`,
    
    requirementsUnderstanding: `Based on our thorough review of the tender documentation and any uploaded files, we understand that you require:\n\n${tender.scopeOfWork}\n\n**Key Technical Requirements:**\n${tender.technicalRequirements}\n\n**Functional Requirements:**\n${tender.functionalRequirements}\n\nOur team has successfully delivered similar projects, as evidenced by our portfolio websites (ipc.he2.ai, ers.he2.ai), which showcase our capabilities in creating sophisticated web applications and document processing systems.`,
    
    technicalApproach: `Our proposed approach leverages cutting-edge technology:\n\n**1. PDF Generation System**\n- Custom PDF generation engine with professional templates\n- Dynamic content rendering\n- Automated report generation capabilities\n\n**2. Website Development**\n- Modern web application following the style and quality of our reference projects (ipc.he2.ai, ers.he2.ai)\n- Responsive design for all devices\n- Scalable architecture\n\n**3. Technology Stack**\n- Frontend: Next.js 14, React, TypeScript, Tailwind CSS\n- Backend: Node.js/Python, PostgreSQL, Redis\n- PDF: Custom generation libraries\n- AI Integration: OpenAI/Claude for intelligent features\n- Infrastructure: AWS/Vercel for deployment\n\n**4. Development Methodology**\n- Agile with bi-weekly sprints\n- Continuous integration/deployment\n- Comprehensive testing (unit, integration, E2E)\n\nOur technical approach will deliver the same quality standards demonstrated in our portfolio.`,
    
    scopeCoverage: `**Scope Analysis:**\n\n✓ **Fully Deliverable (${aiAnalysis.canDeliver}%)**\n- PDF generation system with custom templates\n- Full-featured website (reference: ipc.he2.ai, ers.he2.ai style)\n- Core requirements and features\n- Integration capabilities\n\n⚠ **Partially Deliverable (${aiAnalysis.partialDeliver}%)**\n- Advanced features requiring additional specification\n- Third-party integrations pending clarification\n\n✗ **Out of Scope (${aiAnalysis.outOfScope}%)**\n- Specialized hardware integrations\n- Third-party licensing costs`,
    
    timeline: `**Proposed Project Timeline:**\n\n**Phase 1: Requirements & Design (2-3 weeks)**\n- Detailed requirements gathering\n- PDF template design and mockups\n- Website wireframes and user flows\n- Technical architecture planning\n\n**Phase 2: PDF System Development (3-4 weeks)**\n- PDF generation engine development\n- Template system implementation\n- Testing and optimization\n\n**Phase 3: Website Development (4-5 weeks)**\n- Frontend development (React/Next.js)\n- Backend API development\n- Database setup and integration\n- Quality matching our reference sites\n\n**Phase 4: Integration & Testing (2-3 weeks)**\n- System integration\n- Comprehensive testing\n- User acceptance testing\n- Bug fixes and refinements\n\n**Phase 5: Deployment & Training (1-2 weeks)**\n- Production deployment\n- Team training sessions\n- Documentation delivery\n- Warranty support activation\n\n**Total Duration: 12-17 weeks from project kickoff**`,
    
    commercialDetails: `**Investment Breakdown:**\n\n**Total Project Cost: $180,000 - $280,000**\n\nBreakdown by Phase:\n- Phase 1 (Requirements & Design): $30,000\n- Phase 2 (PDF System): $50,000 - $70,000\n- Phase 3 (Website Development): $70,000 - $100,000\n- Phase 4 (Testing & QA): $20,000 - $30,000\n- Phase 5 (Deployment): $10,000 - $20,000\n\n**Included:**\n- Full source code ownership\n- Comprehensive documentation\n- 3 months warranty support\n- Training for your team\n- Deployment assistance\n\n**Excluded:**\n- Third-party API costs (if any)\n- Cloud hosting fees (AWS/Vercel)\n- Third-party software licenses\n- Post-warranty maintenance\n\n**Payment Terms:**\n- 30% upon project kickoff\n- 40% upon Phase 3 completion\n- 30% upon final delivery and acceptance\n\nAll estimates based on current requirements. Final pricing subject to detailed scope confirmation.`
  };
}

export default {
  generateProposalWithAI,
  autoGenerateProposal
};
