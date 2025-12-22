import { Database } from './supabase-types';

// Export types from generated types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updateable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Database table types
export type DbUser = Tables<'users'>;
export type DbTender = Tables<'tenders'>;
export type DbAiAnalysis = Tables<'ai_analysis'>;
export type DbProposal = Tables<'proposals'>;
export type DbNotification = Tables<'notifications'>;
export type DbUserSettings = Tables<'user_settings'>;
export type DbUploadedFile = Tables<'uploaded_files'>;

// Insertable types
export type InsertUser = Insertable<'users'>;
export type InsertTender = Insertable<'tenders'>;
export type InsertNotification = Insertable<'notifications'>;

// Update types
export type UpdateTender = Updateable<'tenders'>;
export type UpdateProposal = Updateable<'proposals'>;
export type UpdateUserSettings = Updateable<'user_settings'>;

