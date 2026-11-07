import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { TeacherService, StudentInvite, Class } from '../../services/teacher.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-invites',
  templateUrl: './student-invites.component.html',
  styleUrls: ['./student-invites.component.css']
})
export class StudentInvitesComponent implements OnInit {
  invites: Array<StudentInvite & { class: Class }> = [];
  isLoading = true;
  error: string | null = null;
  processingInvites: Set<string> = new Set();

  constructor(
    private teacherService: TeacherService,
    private authService: AuthService,
    private location: Location
  ) {}

  async ngOnInit() {
    await this.loadInvites();
  }

  private async loadInvites() {
    try {
      const userData = await this.authService.getUserData();
      if (userData?.email) {
        const invitesRaw = await this.teacherService.getStudentInvites(userData.email);
        //mapowanie z supabase!!!!!!!!
        this.invites = (invitesRaw || []).map((invite: any) => ({
          ...invite,
          class: invite.classes
        }));
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
      this.error = 'Nie udało się pobrać zaproszeń. Spróbuj ponownie później.';
    } finally {
      this.isLoading = false;
    }
  }

  async handleInvite(invite: StudentInvite, accept: boolean) {
    if (!invite.id || this.processingInvites.has(invite.id)) return;
    
    try {
      this.processingInvites.add(invite.id);
      const status = accept ? 'accepted' : 'rejected';
      await this.teacherService.updateInviteStatus(invite.id, status);
      
      await this.loadInvites();
    } catch (error) {
      console.error('Error handling invite:', error);
      this.error = 'Wystąpił błąd podczas przetwarzania zaproszenia.';
    } finally {
      if (invite.id) {
        this.processingInvites.delete(invite.id);
      }
    }
  }

  isProcessing(inviteId: string | undefined): boolean {
    return inviteId ? this.processingInvites.has(inviteId) : false;
  }

  goBack(): void {
    this.location.back();
  }

  getStatusTranslation(status: string): string {
    const translations: { [key: string]: string } = {
      'pending': 'Oczekujące',
      'accepted': 'Zaakceptowane',
      'rejected': 'Odrzucone'
    };
    return translations[status] || status;
  }
} 