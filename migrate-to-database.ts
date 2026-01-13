/**
 * Data Migration Script
 * Migrates data from file-based storage (data/tenders.json) to Supabase database
 * 
 * Run this once to transfer existing data to the database
 */

import fs from 'fs';
import path from 'path';
import { createServiceClient } from './lib/supabase';

interface FileBasedTender {
  id: string;
  title: string;
  description: string;
  scopeOfWork: string;
  technicalRequirements: string;
  functionalRequirements: string;
  eligibilityCriteria: string;
  submissionDeadline: string;
  status: string;
  createdAt: string;
  createdBy: string;
  documents: Array<{ name: string; url: string; size: number }>;
  aiAnalysis: any;
  proposal: any;
}

async function migrateData() {
  console.log('🚀 Starting data migration from files to Supabase...\n');

  const supabase = createServiceClient();

  // Read data from JSON file
  const dataPath = path.join(process.cwd(), 'data', 'tenders.json');
  
  if (!fs.existsSync(dataPath)) {
    console.log('⚠️  No data file found at:', dataPath);
    console.log('✅ Nothing to migrate. Database is ready for new data.');
    return;
  }

  const rawData = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(rawData);
  const tenders: FileBasedTender[] = data.tenders || [];

  if (tenders.length === 0) {
    console.log('⚠️  No tenders found in data file.');
    console.log('✅ Nothing to migrate. Database is ready for new data.');
    return;
  }

  console.log(`📊 Found ${tenders.length} tender(s) to migrate\n`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const tender of tenders) {
    console.log(`\n📝 Migrating: ${tender.title}`);
    
    try {
      // Check if tender already exists in database
      const { data: existing } = await supabase
        .from('tenders')
        .select('id')
        .eq('id', tender.id)
        .single();

      if (existing) {
        console.log(`   ⏭️  Skipped (already exists)`);
        skipped++;
        continue;
      }

      // Insert tender
      const { data: insertedTender, error: tenderError } = await supabase
        .from('tenders')
        .insert({
          id: tender.id,
          title: tender.title,
          description: tender.description,
          scope_of_work: tender.scopeOfWork,
          technical_requirements: tender.technicalRequirements,
          functional_requirements: tender.functionalRequirements,
          eligibility_criteria: tender.eligibilityCriteria,
          submission_deadline: tender.submissionDeadline,
          status: tender.status,
          created_by: tender.createdBy || 'migrated-user',
          created_at: tender.createdAt,
          updated_at: tender.createdAt
        })
        .select()
        .single();

      if (tenderError) {
        throw tenderError;
      }

      console.log(`   ✅ Tender inserted`);

      // Insert AI analysis if completed
      if (tender.aiAnalysis && tender.aiAnalysis.status === 'completed') {
        const { error: analysisError } = await supabase
          .from('ai_analysis')
          .upsert({
            tender_id: tender.id,
            status: tender.aiAnalysis.status,
            relevance_score: tender.aiAnalysis.relevanceScore,
            feasibility_score: tender.aiAnalysis.feasibilityScore,
            overall_score: tender.aiAnalysis.overallScore,
            can_deliver: tender.aiAnalysis.canDeliver,
            partial_deliver: tender.aiAnalysis.partialDeliver,
            out_of_scope: tender.aiAnalysis.outOfScope,
            gaps: tender.aiAnalysis.gaps,
            risks: tender.aiAnalysis.risks,
            assumptions: tender.aiAnalysis.assumptions,
            completed_at: tender.aiAnalysis.completedAt
          });

        if (analysisError) {
          console.log(`   ⚠️  AI Analysis error:`, analysisError.message);
        } else {
          console.log(`   ✅ AI Analysis inserted`);
        }
      }

      // Insert proposal
      if (tender.proposal) {
        const { error: proposalError } = await supabase
          .from('proposals')
          .upsert({
            tender_id: tender.id,
            status: tender.proposal.status || 'draft',
            executive_summary: tender.proposal.executiveSummary || '',
            requirements_understanding: tender.proposal.requirementsUnderstanding || '',
            technical_approach: tender.proposal.technicalApproach || '',
            scope_coverage: tender.proposal.scopeCoverage || '',
            exclusions: tender.proposal.exclusions || '',
            assumptions: tender.proposal.assumptions || '',
            timeline: tender.proposal.timeline || '',
            commercial_details: tender.proposal.commercialDetails || '',
            submitted_at: tender.proposal.submittedAt,
            reviewed_at: tender.proposal.reviewedAt,
            feedback: tender.proposal.feedback || ''
          });

        if (proposalError) {
          console.log(`   ⚠️  Proposal error:`, proposalError.message);
        } else {
          console.log(`   ✅ Proposal inserted`);
        }
      }

      // Insert documents
      if (tender.documents && tender.documents.length > 0) {
        for (const doc of tender.documents) {
          const { error: docError } = await supabase
            .from('uploaded_files')
            .insert({
              tender_id: tender.id,
              file_name: doc.name,
              file_url: doc.url,
              file_size: doc.size,
              uploaded_by: tender.createdBy || 'migrated-user'
            });

          if (docError) {
            console.log(`   ⚠️  Document error:`, docError.message);
          } else {
            console.log(`   ✅ Document inserted: ${doc.name}`);
          }
        }
      }

      migrated++;
      console.log(`   ✅ Migration complete for: ${tender.title}`);

    } catch (error: any) {
      console.error(`   ❌ Error migrating ${tender.title}:`, error.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Migrated: ${migrated}`);
  console.log(`⏭️  Skipped:  ${skipped}`);
  console.log(`❌ Errors:   ${errors}`);
  console.log(`📁 Total:    ${tenders.length}`);
  console.log('='.repeat(60));

  if (migrated > 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify data in Supabase dashboard');
    console.log('   2. Test API endpoints');
    console.log('   3. (Optional) Backup and delete data/tenders.json');
  }

  if (errors > 0) {
    console.log('\n⚠️  Some errors occurred. Please review the log above.');
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('\n✅ Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });



