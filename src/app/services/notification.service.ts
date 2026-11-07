import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

const SUPABASE_URL = 'https://cvzxaicmwcjnfuhezzpd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2enhhaWNtd2NqbmZ1aGV6enBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTI1NzMsImV4cCI6MjA1NDI2ODU3M30.RdLtVgcCZON9E1m3ZRWNYPh3MXZBnkPK0KfRLPr1XgY';

interface Teacher {
  first_name: string;
  last_name: string;
}

interface Class {
  class_name: string;
  teachers: Teacher;
}

interface InviteData {
  id: string;
  created_at: string;
  classes: Class;
}

export interface InviteNotification {
  id: string;
  class_name: string;
  teacher_name: string;
  created_at: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private supabase: SupabaseClient;
  private inviteNotifications = new BehaviorSubject<InviteNotification[]>([]);

  constructor(private authService: AuthService) {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    this.setupRealTimeSubscription();
  }

  private async setupRealTimeSubscription() {
    const userData = await this.authService.getUserData();
    if (!userData) return;

    this.supabase
      .channel('student_invites')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'student_invites',
          filter: `student_email=eq.${userData.email}`
        },
        async (payload: { new: { [key: string]: any } }) => {
          // Fetch full invite details including class and teacher info
          const { data: inviteData } = await this.supabase
            .from('student_invites')
            .select(`
              id,
              created_at,
              classes (
                class_name,
                teachers (
                  first_name,
                  last_name
                )
              )
            `)
            .eq('id', payload.new['id'])
            .single();

          if (inviteData) {
            const data = inviteData as unknown as InviteData;
            const notification: InviteNotification = {
              id: data.id,
              class_name: data.classes.class_name,
              teacher_name: `${data.classes.teachers.first_name} ${data.classes.teachers.last_name}`,
              created_at: new Date(data.created_at)
            };

            const currentNotifications = this.inviteNotifications.value;
            this.inviteNotifications.next([notification, ...currentNotifications]);
          }
        }
      )
      .subscribe();
  }

  getInviteNotifications(): Observable<InviteNotification[]> {
    return this.inviteNotifications.asObservable();
  }

  async clearNotification(inviteId: string) {
    const currentNotifications = this.inviteNotifications.value;
    this.inviteNotifications.next(
      currentNotifications.filter(notification => notification.id !== inviteId)
    );
  }
} 