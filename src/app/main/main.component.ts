import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { TeacherService } from '../services/teacher.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {
  firstName: string = '';
  pendingInvites: number = 0;

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
        if (userData.email) {
          this.pendingInvites = await this.teacherService.countPendingInvites(userData.email);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      this.firstName = 'Użytkowniku';
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
