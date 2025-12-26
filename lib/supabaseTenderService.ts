import { supabase, createServiceClient } from './supabase';
import { Tender, AIAnalysis, Proposal, UploadedFile } from '@/types';

/**
 * Supabase-based Tender Service
 * Replaces file-based storage with PostgreSQL database
 */

export const supabaseTenderService = {
  /**
   * Get all tenders with related data (AI analysis, proposals, files)
   */
  async getAll(userId?: string, role?: string) {
    try {
      const serviceClient = createServiceClient();
      
      // Use the stored function for optimized query
      const { data, error } = await serviceClient.rpc('get_tenders_with_details', {
        user_role: role || 'admin',
        user_id_param: userId || null
      });

      if (error) throw error;

      // Transform to frontend format
      return (data || []).map((item: any) => item.tender_data);
    } catch (error) {
      console.error('Error fetching tenders:', error);
      throw error;
    }
  },

  /**
   * Get single tender by ID
   */
  async getById(id: string, userId?: string, role?: string) {
    try {
      const tenders = await this.getAll(userId, role);
      return tenders.find((t: any) => t.id === id);
    } catch (error) {
      console.error('Error fetching tender:', error);
      throw error;
    }
  },

  /**
   * Create new tender
   */
  async create(tenderData: {
    title: string;
    description: string;
    scopeOfWork: string;
    technicalRequirements: string;
    functionalRequirements: string;
    eligibilityCriteria: string;
    submissionDeadline: string;
    documents: UploadedFile[];
    createdBy: string; // user ID
  }) {
    const serviceClient = createServiceClient();

    try {
      // Insert tender
      const { data: tender, error: tenderError } = await serviceClient
        .from('tenders')
        .insert({
          title: tenderData.title,
          description: tenderData.description,
          scope_of_work: tenderData.scopeOfWork,
          technical_requirements: tenderData.technicalRequirements,
          functional_requirements: tenderData.functionalRequirements,
          eligibility_criteria: tenderData.eligibilityCriteria,
          submission_deadline: tenderData.submissionDeadline,
          status: 'open',
          created_by: tenderData.createdBy
        })
        .select()
        .single();

      if (tenderError) throw tenderError;

      // Save uploaded documents to uploaded_files table
      if (tenderData.documents && tenderData.documents.length > 0) {
        const fileRecords = tenderData.documents.map(doc => ({
          tender_id: tender.id,
          file_name: doc.name,
          file_url: doc.url,
          file_size: doc.size,
          file_type: doc.url.split('.').pop() || 'unknown', // Extract extension from URL
          uploaded_by: tenderData.createdBy
        }));

        const { error: filesError } = await serviceClient
          .from('uploaded_files')
          .insert(fileRecords);

        if (filesError) {
          console.error('Error saving uploaded files:', filesError);
          // Don't fail tender creation if file save fails
        }
      }

      // Trigger will auto-create ai_analysis and proposals
      // Create notification for admin
      await serviceClient.rpc('create_notification', {
        p_type: 'tender_created',
        p_title: 'New Tender Submitted',
        p_message: `${tender.title} has been submitted and is ready for review.`,
        p_tender_id: tender.id,
        p_created_by: 'client',
        p_target_roles: ['admin']
      });

      return tender;
    } catch (error) {
      console.error('Error creating tender:', error);
      throw error;
    }
  },

  /**
   * Update proposal content
   */
  async updateProposal(tenderId: string, proposalData: Partial<Proposal>) {
    const serviceClient = createServiceClient();

    try {
      const { data, error } = await serviceClient
        .from('proposals')
        .update({
          executive_summary: proposalData.executiveSummary,
          requirements_understanding: proposalData.requirementsUnderstanding,
          technical_approach: proposalData.technicalApproach,
          scope_coverage: proposalData.scopeCoverage,
          exclusions: proposalData.exclusions,
          assumptions: proposalData.assumptions,
          timeline: proposalData.timeline,
          commercial_details: proposalData.commercialDetails,
          status: 'draft' // Always revert to draft on edit
        })
        .eq('tender_id', tenderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating proposal:', error);
      throw error;
    }
  },

  /**
   * Submit proposal to client
   */
  async submitProposal(tenderId: string) {
    const serviceClient = createServiceClient();

    try {
      // Update proposal status
      const { data: proposal, error: proposalError } = await serviceClient
        .from('proposals')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('tender_id', tenderId)
        .select()
        .single();

      if (proposalError) throw proposalError;

      // Get tender info for notification
      const { data: tender } = await serviceClient
        .from('tenders')
        .select('title')
        .eq('id', tenderId)
        .single();

      // Create notification for client
      await serviceClient.rpc('create_notification', {
        p_type: 'proposal_submitted',
        p_title: 'Proposal Received',
        p_message: `Neural Arc has submitted a proposal for "${tender?.title || 'your tender'}". Review it now.`,
        p_tender_id: tenderId,
        p_created_by: 'admin',
        p_target_roles: ['client']
      });

      return proposal;
    } catch (error) {
      console.error('Error submitting proposal:', error);
      throw error;
    }
  },

  /**
   * Client reviews proposal (accept/reject)
   */
  async reviewProposal(tenderId: string, status: 'accepted' | 'rejected', feedback: string) {
    const serviceClient = createServiceClient();

    try {
      // Update proposal
      const { data: proposal, error: proposalError } = await serviceClient
        .from('proposals')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          feedback: feedback || ''
        })
        .eq('tender_id', tenderId)
        .select()
        .single();

      if (proposalError) throw proposalError;

      // Get tender info
      const { data: tender } = await serviceClient
        .from('tenders')
        .select('title')
        .eq('id', tenderId)
        .single();

      // Create notification for admin
      await serviceClient.rpc('create_notification', {
        p_type: status === 'accepted' ? 'proposal_accepted' : 'proposal_rejected',
        p_title: `Proposal ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
        p_message: `Client has ${status === 'accepted' ? 'accepted' : 'rejected'} your proposal for "${tender?.title || 'tender'}".`,
        p_tender_id: tenderId,
        p_created_by: 'client',
        p_target_roles: ['admin']
      });

      return proposal;
    } catch (error) {
      console.error('Error reviewing proposal:', error);
      throw error;
    }
  },

  /**
   * Trigger AI analysis for a tender
   */
  async triggerAIAnalysis(tenderId: string, tenderContent: Tender) {
    const serviceClient = createServiceClient();

    try {
      // Simulate AI analysis (in production, call OpenAI/Claude)
      const analysis = this.generateMockAnalysis(tenderContent);

      const { data, error } = await serviceClient
        .from('ai_analysis')
        .update({
          status: 'completed',
          relevance_score: analysis.relevanceScore,
          feasibility_score: analysis.feasibilityScore,
          overall_score: analysis.overallScore,
          can_deliver: analysis.canDeliver,
          partial_deliver: analysis.partialDeliver,
          out_of_scope: analysis.outOfScope,
          gaps: analysis.gaps,
          risks: analysis.risks,
          assumptions: analysis.assumptions,
          completed_at: new Date().toISOString()
        })
        .eq('tender_id', tenderId)
        .select()
        .single();

      if (error) throw error;

      // Auto-generate proposal based on analysis
      await this.generateProposal(tenderId, tenderContent, analysis);

      return data;
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
      throw error;
    }
  },

  /**
   * Generate AI-powered proposal
   */
  async generateProposal(tenderId: string, tender: Tender, analysis: any) {
    const serviceClient = createServiceClient();

    const executiveSummary = `Neural Arc Inc is pleased to submit this proposal for "${tender.title}". With our extensive experience in AI-driven solutions and software development, we are confident in delivering a solution that meets your requirements. Our analysis indicates a ${analysis.overallScore}% alignment with your needs, and we are committed to addressing all aspects of this project with excellence.`;

    const technicalApproach = `Our proposed technical approach leverages industry best practices and cutting-edge technologies:\n\n1. **Architecture Design**: We will implement a scalable, modular architecture that ensures maintainability and future extensibility.\n\n2. **Technology Stack**: Based on the requirements, we recommend using modern frameworks and tools that align with your technical specifications.\n\n3. **Development Methodology**: We follow Agile methodologies with bi-weekly sprints, ensuring continuous delivery and stakeholder engagement.\n\n4. **Quality Assurance**: Comprehensive testing strategy including unit tests, integration tests, and user acceptance testing.\n\n5. **Security**: Implementation of industry-standard security practices including encryption, authentication, and regular security audits.`;

    try {
      const { data, error } = await serviceClient
        .from('proposals')
        .update({
          executive_summary: executiveSummary,
          requirements_understanding: `Based on our thorough review of the tender documentation, we understand that you require:\n\n${tender.scopeOfWork}\n\nKey Technical Requirements:\n${tender.technicalRequirements}\n\nWe have carefully analyzed these requirements and are prepared to deliver a comprehensive solution.`,
          technical_approach: technicalApproach,
          scope_coverage: `Based on our analysis:\n\n✓ **Fully Deliverable (${analysis.canDeliver}%)**: Core requirements\n⚠ **Partially Deliverable (${analysis.partialDeliver}%)**: Advanced features requiring clarification\n✗ **Out of Scope (${analysis.outOfScope}%)**: Items requiring specialized expertise`,
          exclusions: 'Third-party licensing costs, Hardware procurement, Post-deployment maintenance beyond warranty period',
          assumptions: `1. Client will provide timely feedback and approvals\n2. All necessary access and credentials will be provided\n3. Requirements are stable and changes will follow change management process`,
          timeline: 'Phase 1 - Requirements & Design (2-3 weeks)\nPhase 2 - Development & Testing (6-8 weeks)\nPhase 3 - Deployment & Training (1-2 weeks)\nTotal: 10-14 weeks from project kickoff'
        })
        .eq('tender_id', tenderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating proposal:', error);
      throw error;
    }
  },

  /**
   * Improved AI analysis generator
   * Uses logarithmic scaling, word boundaries, and calculated feasibility
   */
  generateMockAnalysis(tender: any) {
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
    const wordCount = text.split(/\s+/).length;
    
    let totalScore = 0;
    const matchedCategories: string[] = [];
    
    Object.entries(keywords).forEach(([category, categoryKeywords]) => {
      let categoryScore = 0;
      let categoryHasMatches = false;
      
      categoryKeywords.forEach(keyword => {
        // Use word boundary to avoid substring matches
        const escapedKeyword = keyword.replace(/\s+/g, '\\s+');
        const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
        const matches = text.match(regex);
        const count = matches ? matches.length : 0;
        
        if (count > 0) {
          categoryHasMatches = true;
          // Logarithmic scaling: log2(count + 1) * 10, capped at 20 per keyword
          const keywordScore = Math.min(Math.log2(count + 1) * 10, 20);
          categoryScore += keywordScore;
        }
      });
      
      if (categoryHasMatches) {
        matchedCategories.push(category);
        // Cap each category at 25 points
        totalScore += Math.min(categoryScore, 25);
      }
    });

    // Normalize by document length (penalize keyword stuffing, reward substantial content)
    const lengthPenalty = Math.min(wordCount / 1000, 1);
    const normalizedScore = totalScore * lengthPenalty;
    
    // Calculate final scores
    const relevanceScore = Math.min(Math.round(normalizedScore), 95);
    
    // Calculate feasibility based on category coverage (deterministic, not random)
    const categoryCount = matchedCategories.length;
    const categoryCoverage = (categoryCount / Object.keys(keywords).length) * 100;
    const feasibilityScore = Math.min(Math.round((relevanceScore * 0.7) + (categoryCoverage * 0.3)), 95);
    
    const overallScore = Math.round((relevanceScore + feasibilityScore) / 2);

    let canDeliver: number;
    let partialDeliver: number;
    let outOfScope: number;
    
    if (overallScore >= 80) {
      canDeliver = 85 + Math.floor(Math.random() * 10);
      partialDeliver = 15 - Math.floor(Math.random() * 10);
    } else {
      canDeliver = 60 + Math.floor(Math.random() * 15);
      partialDeliver = 25 + Math.floor(Math.random() * 10);
    }
    outOfScope = 100 - canDeliver - partialDeliver;

    return {
      relevanceScore,
      feasibilityScore,
      overallScore,
      canDeliver,
      partialDeliver,
      outOfScope,
      gaps: ['Security requirements need clarification', 'Infrastructure details not specified'],
      risks: ['Third-party dependencies may affect timeline'],
      assumptions: ['Client will provide timely feedback', 'All necessary access will be provided']
    };
  }
};
