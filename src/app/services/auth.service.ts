import { Injectable } from '@angular/core';
import { createClient, AuthResponse, SupabaseClient, User } from '@supabase/supabase-js';
import { Router } from '@angular/router';

const SUPABASE_URL = 'https://cvzxaicmwcjnfuhezzpd.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2enhhaWNtd2NqbmZ1aGV6enBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTI1NzMsImV4cCI6MjA1NDI2ODU3M30.RdLtVgcCZON9E1m3ZRWNYPh3MXZBnkPK0KfRLPr1XgY'; // Wstaw poprawny klucz

export interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: 'student' | 'teacher';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private currentSession: any = null;

  constructor(private router: Router) {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    this.checkSession();
  }

  private async checkSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (session) {
      this.currentSession = session;
    }
  }

  async register(email: string, password: string, firstName: string, lastName: string, isTeacher: boolean = false): Promise<AuthResponse['data'] | null> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName
        }
      }
    });

    if (error) {
      console.error('Registration error:', error);
      return null;
    }

    
    if (data.user) {
      const { error: profileError } = await this.supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            email: email,
            role: isTeacher ? 'teacher' : 'student'
          }
        ]);

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        
        if (data.user.id) {
          await this.supabase.auth.admin.deleteUser(data.user.id);
        }
        return null;
      }
    }

    return data;
  }
  
  async login(email: string, password: string, rememberMe: boolean = false, isTeacher: boolean = false): Promise<AuthResponse['data'] | null> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Błąd logowania:', error);
      return null;
    }

  
    const { data: userData, error: userError } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', data.user?.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      await this.logout();
      return null;
    }

   
    if (isTeacher && userData.role !== 'teacher') {
      await this.logout();
      throw new Error('To konto nie jest kontem nauczyciela');
    } else if (!isTeacher && userData.role === 'teacher') {
      await this.logout();
      throw new Error('Proszę użyć logowania dla nauczycieli');
    }


    if (!rememberMe) {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
    }

    return data;
  }

  async logout() {
    await this.supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getUserFirstName(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.user_metadata?.['firstName'] || null;
  }

  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session !== null;
  }

  async getUserData(): Promise<UserData | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  async isTeacher(): Promise<boolean> {
    const userData = await this.getUserData();
    return userData?.role === 'teacher';
  }
}

