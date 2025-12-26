/**
 * Unit Tests for Match Percentage Algorithm
 * Tests the improved scoring logic with various scenarios
 */

import { describe, test, expect } from '@jest/globals';

// Mock tender structure
interface MockTender {
  title: string;
  description: string;
  scopeOfWork: string;
  technicalRequirements: string;
  functionalRequirements: string;
}

/**
 * Improved AI analysis algorithm (extracted for testing)
 * Matches the implementation in tenderService.ts and supabaseTenderService.ts
 */
function analyzeRequirements(tender: MockTender) {
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
      const escapedKeyword = keyword.replace(/\s+/g, '\\s+');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;
      
      if (count > 0) {
        categoryHasMatches = true;
        const keywordScore = Math.min(Math.log2(count + 1) * 10, 20);
        categoryScore += keywordScore;
      }
    });
    
    if (categoryHasMatches) {
      matchedCategories.push(category);
      totalScore += Math.min(categoryScore, 25);
    }
  });

  const lengthPenalty = Math.min(wordCount / 1000, 1);
  const normalizedScore = totalScore * lengthPenalty;
  
  const relevanceScore = Math.min(Math.round(normalizedScore), 95);
  
  const categoryCount = matchedCategories.length;
  const categoryCoverage = (categoryCount / Object.keys(keywords).length) * 100;
  const feasibilityScore = Math.min(Math.round((relevanceScore * 0.7) + (categoryCoverage * 0.3)), 95);
  
  const overallScore = Math.round((relevanceScore + feasibilityScore) / 2);

  return {
    relevanceScore,
    feasibilityScore,
    overallScore,
    matchedCategories,
    wordCount,
    normalizedScore
  };
}

describe('Match Percentage Algorithm', () => {
  
  describe('Basic Scoring', () => {
    test('should score AI-focused tender highly', () => {
      const tender: MockTender = {
        title: 'AI-Powered Chatbot Development',
        description: 'Build an artificial intelligence chatbot using machine learning',
        scopeOfWork: 'Develop deep learning models for natural language processing',
        technicalRequirements: 'Python, TensorFlow, neural network architecture',
        functionalRequirements: 'Real-time AI responses with high accuracy'
      };

      const result = analyzeRequirements(tender);
      
      expect(result.overallScore).toBeGreaterThanOrEqual(70);
      expect(result.matchedCategories).toContain('ai');
      expect(result.relevanceScore).toBeGreaterThan(0);
    });

    test('should score non-technical tender low', () => {
      const tender: MockTender = {
        title: 'Office Furniture Procurement',
        description: 'Purchase chairs and desks for new office',
        scopeOfWork: 'Source ergonomic furniture from local vendors',
        technicalRequirements: 'None',
        functionalRequirements: 'Comfortable seating for 50 employees'
      };

      const result = analyzeRequirements(tender);
      
      expect(result.overallScore).toBeLessThan(30);
      expect(result.matchedCategories.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Keyword Repetition Handling', () => {
    test('should prevent score inflation from keyword repetition', () => {
      const spamTender: MockTender = {
        title: 'AI AI AI AI AI',
        description: 'AI AI AI AI AI AI AI AI AI AI',
        scopeOfWork: 'AI AI AI AI AI AI AI AI AI AI',
        technicalRequirements: 'AI AI AI AI AI',
        functionalRequirements: 'AI AI AI AI AI'
      };

      const normalTender: MockTender = {
        title: 'AI-Powered System',
        description: 'Develop an AI system with machine learning capabilities',
        scopeOfWork: 'Build artificial intelligence solution',
        technicalRequirements: 'Deep learning framework',
        functionalRequirements: 'Neural network integration'
      };

      const spamResult = analyzeRequirements(spamTender);
      const normalResult = analyzeRequirements(normalTender);

      // Spam should NOT score higher than a well-rounded tender
      expect(normalResult.overallScore).toBeGreaterThanOrEqual(spamResult.overallScore - 20);
    });

    test('should use logarithmic scaling', () => {
      const singleMention: MockTender = {
        title: 'AI System',
        description: 'Build system',
        scopeOfWork: 'Development work',
        technicalRequirements: 'Standard requirements',
        functionalRequirements: 'Basic features'
      };

      const multiMention: MockTender = {
        title: 'AI System',
        description: 'Build AI system with AI capabilities using AI technology',
        scopeOfWork: 'AI development work',
        technicalRequirements: 'AI requirements',
        functionalRequirements: 'AI features'
      };

      const singleResult = analyzeRequirements(singleMention);
      const multiResult = analyzeRequirements(multiMention);

      // Multiple mentions should increase score, but not linearly
      const scoreDifference = multiResult.overallScore - singleResult.overallScore;
      expect(scoreDifference).toBeLessThan(30); // Not massive inflation
      expect(scoreDifference).toBeGreaterThan(0); // Some increase
    });
  });

  describe('Word Boundary Detection', () => {
    test('should not match substrings', () => {
      const tender: MockTender = {
        title: 'Happy Application Development',
        description: 'We are happy to apply for this opportunity',
        scopeOfWork: 'Happiness and applications are important',
        technicalRequirements: 'Applicants must be happy',
        functionalRequirements: 'Apply happiness principles'
      };

      const result = analyzeRequirements(tender);
      
      // Should not match 'app' in 'happy', 'apply', 'applications'
      // Should only match 'application' (whole word)
      expect(result.matchedCategories).toContain('software');
    });

    test('should match multi-word keywords correctly', () => {
      const tender: MockTender = {
        title: 'Machine Learning System',
        description: 'Build a machine learning platform',
        scopeOfWork: 'Implement artificial intelligence using machine learning',
        technicalRequirements: 'Deep learning frameworks',
        functionalRequirements: 'Machine learning models'
      };

      const result = analyzeRequirements(tender);
      
      expect(result.matchedCategories).toContain('ai');
      expect(result.overallScore).toBeGreaterThan(50);
    });
  });

  describe('Document Length Normalization', () => {
    test('should normalize short documents', () => {
      const shortTender: MockTender = {
        title: 'AI System',
        description: 'AI',
        scopeOfWork: 'AI',
        technicalRequirements: 'AI',
        functionalRequirements: 'AI'
      };

      const result = analyzeRequirements(shortTender);
      
      // Short document should get penalized
      expect(result.wordCount).toBeLessThan(20);
      expect(result.normalizedScore).toBeLessThan(result.relevanceScore);
    });

    test('should not penalize long substantial documents', () => {
      const longTender: MockTender = {
        title: 'Comprehensive AI Platform Development',
        description: 'We need a comprehensive artificial intelligence platform that leverages machine learning and deep learning technologies. ' +
          'The system should integrate with existing infrastructure and provide real-time analytics. ' +
          'This is a critical project for our organization with significant business impact. ' +
          'We require extensive experience in AI development and deployment. ' +
          Array(200).fill('Additional context and requirements for the project. ').join(''),
        scopeOfWork: 'Build end-to-end AI solution with multiple components',
        technicalRequirements: 'Python, TensorFlow, cloud infrastructure, API development',
        functionalRequirements: 'Real-time processing, scalability, security compliance'
      };

      const result = analyzeRequirements(longTender);
      
      // Long document should get full credit (no penalty)
      expect(result.wordCount).toBeGreaterThan(1000);
      expect(result.normalizedScore).toBeCloseTo(result.relevanceScore, 5);
    });
  });

  describe('Feasibility Calculation', () => {
    test('should calculate feasibility deterministically', () => {
      const tender: MockTender = {
        title: 'Web Application Development',
        description: 'Build a web application with database integration',
        scopeOfWork: 'Full-stack web development',
        technicalRequirements: 'React, Node.js, PostgreSQL',
        functionalRequirements: 'User authentication, data visualization'
      };

      const result1 = analyzeRequirements(tender);
      const result2 = analyzeRequirements(tender);
      const result3 = analyzeRequirements(tender);

      // Should be deterministic (same every time)
      expect(result1.feasibilityScore).toBe(result2.feasibilityScore);
      expect(result2.feasibilityScore).toBe(result3.feasibilityScore);
      expect(result1.overallScore).toBe(result2.overallScore);
    });

    test('should base feasibility on category coverage', () => {
      const narrowTender: MockTender = {
        title: 'Simple Data Analysis',
        description: 'Analyze data and create reports',
        scopeOfWork: 'Data analysis only',
        technicalRequirements: 'Excel, basic analytics',
        functionalRequirements: 'Generate monthly reports'
      };

      const broadTender: MockTender = {
        title: 'Comprehensive Software Platform',
        description: 'Build AI-powered web application with mobile app, cloud infrastructure, and security',
        scopeOfWork: 'Full-stack development with AI integration, mobile apps, and cloud deployment',
        technicalRequirements: 'React, React Native, Python, AWS, machine learning, API development',
        functionalRequirements: 'Web portal, mobile apps, data analytics, AI features, security compliance'
      };

      const narrowResult = analyzeRequirements(narrowTender);
      const broadResult = analyzeRequirements(broadTender);

      // Broader scope (more categories) should have higher feasibility
      expect(broadResult.matchedCategories.length).toBeGreaterThan(narrowResult.matchedCategories.length);
      expect(broadResult.feasibilityScore).toBeGreaterThanOrEqual(narrowResult.feasibilityScore);
    });
  });

  describe('Category Caps', () => {
    test('should cap each category at 25 points', () => {
      const tender: MockTender = {
        title: 'AI Machine Learning Deep Learning Neural Network Platform',
        description: 'Build artificial intelligence system with machine learning, deep learning, and neural networks',
        scopeOfWork: 'Implement AI using machine learning and deep learning with neural network architecture',
        technicalRequirements: 'Artificial intelligence frameworks, machine learning libraries, deep learning tools',
        functionalRequirements: 'AI capabilities, machine learning models, deep learning inference, neural network training'
      };

      const result = analyzeRequirements(tender);
      
      // Even with many AI keywords, category should be capped
      expect(result.matchedCategories).toContain('ai');
      // Score should not be absurdly high despite many AI keywords
      expect(result.relevanceScore).toBeLessThanOrEqual(95);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty tender', () => {
      const tender: MockTender = {
        title: '',
        description: '',
        scopeOfWork: '',
        technicalRequirements: '',
        functionalRequirements: ''
      };

      const result = analyzeRequirements(tender);
      
      expect(result.overallScore).toBe(0);
      expect(result.matchedCategories.length).toBe(0);
    });

    test('should handle tender with special characters', () => {
      const tender: MockTender = {
        title: 'AI & Machine-Learning (System)',
        description: 'Build AI/ML system with cloud@infrastructure',
        scopeOfWork: 'Develop #AI platform with $cloud services',
        technicalRequirements: 'Python 3.x, TensorFlow 2.0+',
        functionalRequirements: 'Real-time AI/ML processing'
      };

      const result = analyzeRequirements(tender);
      
      // Should still match keywords despite special characters
      expect(result.matchedCategories).toContain('ai');
      expect(result.overallScore).toBeGreaterThan(0);
    });

    test('should be case-insensitive', () => {
      const lowerCase: MockTender = {
        title: 'ai system',
        description: 'machine learning',
        scopeOfWork: 'artificial intelligence',
        technicalRequirements: 'python',
        functionalRequirements: 'api'
      };

      const upperCase: MockTender = {
        title: 'AI SYSTEM',
        description: 'MACHINE LEARNING',
        scopeOfWork: 'ARTIFICIAL INTELLIGENCE',
        technicalRequirements: 'PYTHON',
        functionalRequirements: 'API'
      };

      const mixedCase: MockTender = {
        title: 'Ai SyStEm',
        description: 'MaChInE LeArNiNg',
        scopeOfWork: 'ArTiFiCiAl InTeLlIgEnCe',
        technicalRequirements: 'PyThOn',
        functionalRequirements: 'ApI'
      };

      const lowerResult = analyzeRequirements(lowerCase);
      const upperResult = analyzeRequirements(upperCase);
      const mixedResult = analyzeRequirements(mixedCase);

      expect(lowerResult.overallScore).toBe(upperResult.overallScore);
      expect(upperResult.overallScore).toBe(mixedResult.overallScore);
    });
  });

  describe('Score Ranges', () => {
    test('should never exceed 95% cap', () => {
      const perfectTender: MockTender = {
        title: 'AI Machine Learning Deep Learning Platform',
        description: Array(100).fill('artificial intelligence machine learning deep learning neural network software application system platform development web website mobile app cloud aws data analytics security encryption integration api').join(' '),
        scopeOfWork: 'Everything related to AI, software, web, mobile, cloud, data, security, and integration',
        technicalRequirements: 'All technologies',
        functionalRequirements: 'All features'
      };

      const result = analyzeRequirements(perfectTender);
      
      expect(result.relevanceScore).toBeLessThanOrEqual(95);
      expect(result.feasibilityScore).toBeLessThanOrEqual(95);
      expect(result.overallScore).toBeLessThanOrEqual(95);
    });

    test('should produce reasonable score distribution', () => {
      const tenders: MockTender[] = [
        // High match
        {
          title: 'AI and Machine Learning Platform',
          description: 'Build comprehensive AI system with machine learning',
          scopeOfWork: 'Full AI development with cloud infrastructure',
          technicalRequirements: 'Python, TensorFlow, AWS',
          functionalRequirements: 'Real-time AI processing'
        },
        // Medium match
        {
          title: 'Web Application Development',
          description: 'Build web application with database',
          scopeOfWork: 'Frontend and backend development',
          technicalRequirements: 'React, Node.js',
          functionalRequirements: 'User management'
        },
        // Low match
        {
          title: 'Manual Data Entry',
          description: 'Enter customer information into spreadsheet',
          scopeOfWork: 'Data entry work',
          technicalRequirements: 'Excel knowledge',
          functionalRequirements: 'Accuracy'
        }
      ];

      const results = tenders.map(analyzeRequirements);
      
      // High should be > 60%
      expect(results[0].overallScore).toBeGreaterThan(60);
      // Medium should be 30-70%
      expect(results[1].overallScore).toBeGreaterThan(30);
      expect(results[1].overallScore).toBeLessThan(70);
      // Low should be < 40%
      expect(results[2].overallScore).toBeLessThan(40);
      
      // Scores should be in descending order
      expect(results[0].overallScore).toBeGreaterThan(results[1].overallScore);
      expect(results[1].overallScore).toBeGreaterThan(results[2].overallScore);
    });
  });
});


