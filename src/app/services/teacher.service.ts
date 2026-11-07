import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

const SUPABASE_URL = 'https://cvzxaicmwcjnfuhezzpd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2enhhaWNtd2NqbmZ1aGV6enBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTI1NzMsImV4cCI6MjA1NDI2ODU3M30.RdLtVgcCZON9E1m3ZRWNYPh3MXZBnkPK0KfRLPr1XgY';

export interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  school_name: string;
  subject_taught: string;
  created_at?: Date;
}

export interface TeacherCreate {
  first_name: string;
  last_name: string;
  email: string;
  school_name: string;
  subject_taught: string;
}

export interface Class {
  id?: string;
  teacher_id: string;
  class_name: string;
  subject: string;
  created_at?: Date;
}

export interface StudentInvite {
  id?: string;
  class_id: string;
  student_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: Date;
}

interface ClassMemberWithClass {
  classes: Class;
}

interface QuizScore {
  student_email: string;
  score: number;
  [key: string]: any;
}

interface StudentScores {
  [email: string]: QuizScore[];
}

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://cvzxaicmwcjnfuhezzpd.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2enhhaWNtd2NqbmZ1aGV6enBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTI1NzMsImV4cCI6MjA1NDI2ODU3M30.RdLtVgcCZON9E1m3ZRWNYPh3MXZBnkPK0KfRLPr1XgY'
    );
  }


  async registerTeacher(teacherData: {
    first_name: string;
    last_name: string;
    email: string;
    school_name: string;
    subject_taught: string;
  }, userId: string) {
    const { error } = await this.supabase
      .from('teachers')
      .insert([{
        id: userId,
        ...teacherData
      }]);

    if (error) throw error;
  }


  async getTeacherProfile(teacherId: string) {
    const { data, error } = await this.supabase
      .from('teachers')
      .select('*')
      .eq('id', teacherId)
      .single();

    if (error) throw error;
    return data;
  }


  async createClass(classData: any) {
    const { data, error } = await this.supabase
      .from('classes')
      .insert([classData])
      .select();

    if (error) throw error;
    return data;
  }

  // Get teacher's classes
  async getTeacherClasses(teacherId: string) {
    const { data, error } = await this.supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId);

    if (error) throw error;
    return data;
  }


  async inviteStudent(inviteData: any) {
    const { data, error } = await this.supabase
      .from('student_invites')
      .insert([inviteData])
      .select();

    if (error) throw error;
    return data;
  }

  async getClassStudents(classId: string) {
    const { data, error } = await this.supabase
      .from('class_members')
      .select('*')
      .eq('class_id', classId);

    if (error) throw error;
    return data;
  }


  async getStudentScores(classId: string) {
    const { data, error } = await this.supabase
      .from('leaderboard')
      .select('*')
      .eq('class_id', classId);

    if (error) throw error;
    return data;
  }


  async getStudentInvites(studentEmail: string) {
    const { data, error } = await this.supabase
      .from('student_invites')
      .select(`
        *,
        class:classes (
          *,
          teachers (*)
        )
      `)
      .eq('student_email', studentEmail);

    if (error) throw error;
    return data;
  }


  async countPendingInvites(studentEmail: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('student_invites')
      .select('*', { count: 'exact', head: true })
      .eq('student_email', studentEmail)
      .eq('status', 'pending');

    if (error) throw error;
    return count || 0;
  }


  async updateInviteStatus(inviteId: string, status: 'accepted' | 'rejected') {
    const { error } = await this.supabase
      .from('student_invites')
      .update({ status })
      .eq('id', inviteId);

    if (error) throw error;
  }


  async getStudentClasses(studentId: string) {
    const { data, error } = await this.supabase
      .from('class_members')
      .select(`
        *,
        classes (
          *,
          teachers (*)
        )
      `)
      .eq('student_id', studentId);

    if (error) throw error;
    return data;
  }

  async getClassStudentsWithScores(classId: string) {
    const { data: members, error: membersError } = await this.supabase
      .from('class_members')
      .select('*')
      .eq('class_id', classId);

    if (membersError) throw membersError;

    const { data: scores, error: scoresError } = await this.supabase
      .from('leaderboard')
      .select('*')
      .eq('class_id', classId);

    if (scoresError) throw scoresError;

    const studentScores: StudentScores = {};
    scores.forEach((score: QuizScore) => {
      if (!studentScores[score.student_email]) {
        studentScores[score.student_email] = [];
      }
      studentScores[score.student_email].push(score);
    });

    return members.map(member => ({
      ...member,
      scores: studentScores[member.student_email] || []
    }));
  }

  async getClassScores(classId: string) {
    const { data, error } = await this.supabase
      .from('game_scores')
      .select(`
        *,
        users (
          first_name,
          last_name
        )
      `)
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
} 