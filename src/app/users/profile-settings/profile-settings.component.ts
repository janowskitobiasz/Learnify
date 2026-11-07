import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.css'
})
export class ProfileSettingsComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  role: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        const userData = await this.authService.getUserData();
        if (userData) {
          this.firstName = userData.first_name || '';
          this.lastName = userData.last_name || '';
          this.email = userData.email || '';
          this.role = userData.role === 'teacher' ? 'Nauczyciel' : 'Uczeń';
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
