import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cvzxaicmwcjnfuhezzpd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2enhhaWNtd2NqbmZ1aGV6enBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTI1NzMsImV4cCI6MjA1NDI2ODU3M30.RdLtVgcCZON9E1m3ZRWNYPh3MXZBnkPK0KfRLPr1XgY';

export interface LeaderboardEntry {
  id?: string;
  user_id: string;
  score: number;
  total_questions: number;
  subject: string;
  difficulty: string;
  class_id?: string | null;
  created_at?: Date;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  async addScore(entry: Omit<LeaderboardEntry, 'id' | 'created_at'>): Promise<LeaderboardEntry> {
    try {
      console.log('Adding score with data:', entry); // Debug log
      
      const { data, error } = await this.supabase
        .from('leaderboard')
        .insert([{
          user_id: entry.user_id,
          score: entry.score,
          total_questions: entry.total_questions,
          subject: entry.subject,
          difficulty: entry.difficulty,
          class_id: entry.class_id || null,
          user_first_name: entry.user_first_name,
          user_last_name: entry.user_last_name,
          user_email: entry.user_email
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Błąd podczas zapisywania wyniku: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('Error in addScore:', error);
      throw error;
    }
  }

  async getLeaderboard(subject?: string, classId?: string): Promise<LeaderboardEntry[]> {
    try {
      let query = this.supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false });

      if (subject) {
        query = query.eq('subject', subject);
      }

      if (classId) {
        // Only show scores from students in this class
        const { data: classMembers } = await this.supabase
          .from('class_members')
          .select('student_email')
          .eq('class_id', classId);

        if (classMembers && classMembers.length > 0) {
          const studentEmails = classMembers.map(member => member.student_email);
          query = query.in('user_email', studentEmails);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Błąd podczas pobierania wyników: ' + error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      throw error;
    }
  }

  async getUserScores(userId: string): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Błąd podczas pobierania wyników użytkownika: ' + error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserScores:', error);
      throw error;
    }
  }
} 