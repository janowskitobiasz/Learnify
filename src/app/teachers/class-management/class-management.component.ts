import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TeacherService, Class, StudentInvite } from '../../services/teacher.service';
import { Router } from '@angular/router';

export interface StudentWithScores extends StudentInvite {
  scores?: {
    score: number;
    total_questions: number;
    subject: string;
    difficulty: string;
    created_at: Date;
    user_first_name: string;
    user_last_name: string;
  }[];
  showScores?: boolean;
}

@Component({
  selector: 'app-class-management',
  templateUrl: './class-management.component.html',
  styleUrl: './class-management.component.css'
})
export class ClassManagementComponent implements OnInit {
  classes: Class[] = [];
  selectedClass: Class | null = null;
  students: StudentWithScores[] = [];
  isLoading = false;
  error: string | null = null;
  firstName: string = '';
  showScores = false;
  classScores: any[] = [];

  newClass = {
    class_name: '',
    subject: ''
  };

  newInvite = {
    student_email: ''
  };

  constructor(
    private authService: AuthService,
    private teacherService: TeacherService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const userData = await this.authService.getUserData();
      if (userData) {
        this.firstName = userData.first_name;
        await this.loadClasses(userData.id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      this.error = 'Nie udało się załadować klas.';
    }
  }

  async loadClasses(teacherId: string) {
    try {
      this.classes = await this.teacherService.getTeacherClasses(teacherId);
    } catch (error) {
      console.error('Error loading classes:', error);
      this.error = 'Nie udało się załadować klas.';
    }
  }

  async createClass() {
    try {
      this.isLoading = true;
      const user = await this.authService.getCurrentUser();
      if (user && this.newClass.class_name && this.newClass.subject) {
        const classData = {
          teacher_id: user.id,
          class_name: this.newClass.class_name,
          subject: this.newClass.subject
        };
        
        await this.teacherService.createClass(classData);
        await this.loadClasses(user.id);
        this.newClass.class_name = '';
        this.newClass.subject = '';
      }
    } catch (error) {
      console.error('Error creating class:', error);
      this.error = 'Nie udało się utworzyć klasy.';
    } finally {
      this.isLoading = false;
    }
  }

  async selectClass(classId: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      // Get basic student info from invites
      const invites = await this.teacherService.getClassStudents(classId);
      
      // Get student scores
      const studentsWithScores = await this.teacherService.getClassStudentsWithScores(classId);
      
      // Merge invites with scores
      this.students = invites.map(invite => {
        const studentScores = studentsWithScores.find(s => s.student_email === invite.student_email);
        return {
          ...invite,
          scores: studentScores?.leaderboard || []
        };
      });

      this.selectedClass = this.classes.find(c => c.id === classId) || null;
    } catch (error) {
      console.error('Error loading class details:', error);
      this.error = 'Nie udało się załadować szczegółów klasy.';
    } finally {
      this.isLoading = false;
    }
  }

  async viewClassScores(selectedClass: Class) {
    if (!selectedClass?.id) return;
    
    try {
      this.isLoading = true;
      const scores = await this.teacherService.getClassScores(selectedClass.id);
      this.classScores = scores;
      this.showScores = true;
    } catch (error) {
      console.error('Error loading class scores:', error);
      this.error = 'Nie udało się załadować wyników klasy.';
    } finally {
      this.isLoading = false;
    }
  }

  async inviteStudent() {
    try {
      if (this.selectedClass && this.newInvite.student_email) {
        await this.teacherService.inviteStudent({
          class_id: this.selectedClass.id!,
          student_email: this.newInvite.student_email,
          status: 'pending'
        });
        this.students = await this.teacherService.getClassStudents(this.selectedClass.id!);
        this.newInvite.student_email = '';
      }
    } catch (error) {
      console.error('Error inviting student:', error);
      this.error = 'Nie udało się zaprosić ucznia.';
    }
  }

  hideScores() {
    this.showScores = false;
    this.classScores = [];
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'badge bg-warning';
      case 'accepted':
        return 'badge bg-success';
      case 'rejected':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Oczekujące';
      case 'accepted':
        return 'Zaakceptowane';
      case 'rejected':
        return 'Odrzucone';
      default:
        return status;
    }
  }

  getDifficultyBadgeClass(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'badge bg-success';
      case 'medium':
        return 'badge bg-warning';
      case 'hard':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getDifficultyLabel(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'Łatwy';
      case 'medium':
        return 'Średni';
      case 'hard':
        return 'Trudny';
      default:
        return difficulty;
    }
  }

  getScorePercentage(score: number, total: number): number {
    return (score / total) * 100;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/teacher-login']);
  }
}
