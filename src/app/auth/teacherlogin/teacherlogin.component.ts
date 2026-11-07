import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-teacherlogin',
  templateUrl: './teacherlogin.component.html',
  styleUrl: './teacherlogin.component.css'
})
export class TeacherloginComponent {
  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };
  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.loginData.email || !this.loginData.password) {
      this.error = 'Proszę wypełnić wszystkie pola.';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const authData = await this.authService.login(
        this.loginData.email,
        this.loginData.password,
        this.loginData.rememberMe,
        true // This indicates it's a teacher login
      );

      if (authData && authData.user) {
        // Redirect to teacher dashboard
        this.router.navigate(['/teacher/classes']);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'To konto nie jest kontem nauczyciela') {
        this.error = error.message;
      } else {
        this.error = 'Wystąpił błąd podczas logowania. Spróbuj ponownie.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
