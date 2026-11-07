import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  teacherLoginClicks: number = 0;
  showTeacherLink: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  async loginUser() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Proszę wypełnić wszystkie pola.';
      return;
    }

    try {
      this.isLoading = true;
      const user = await this.authService.login(this.email, this.password, this.rememberMe, false);
      
      if (user) {
        this.successMessage = 'Logowanie zakończone sukcesem!';
        setTimeout(() => {
          this.router.navigate(['/main']);
        }, 1000);
      }
    } catch (error: any) {
      console.error('Błąd logowania:', error);
      if (error.message === 'Proszę użyć logowania dla nauczycieli') {
        this.errorMessage = error.message;
      } else if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'Nie znaleziono użytkownika o podanym adresie email.';
      } else if (error.code === 'auth/wrong-password') {
        this.errorMessage = 'Nieprawidłowe hasło.';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Nieprawidłowy format adresu email.';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Zbyt wiele nieudanych prób logowania. Spróbuj ponownie później.';
      } else {
        this.errorMessage = 'Wystąpił błąd podczas logowania. Spróbuj ponownie.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  onLogoClick() {
    this.teacherLoginClicks++;
    if (this.teacherLoginClicks >= 3) {
      this.showTeacherLink = true;
    }
  }
}
