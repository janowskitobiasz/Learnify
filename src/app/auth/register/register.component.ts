import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  first_name: string = '';
  last_name: string = '';
  email: string = '';
  password: string = '';
  isTeacher: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Check if this is teacher registration based on the route
    this.isTeacher = this.router.url === '/teacher/register';
  }

  async registerUser() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password || !this.first_name || !this.last_name) {
      this.errorMessage = 'Proszę wypełnić wszystkie pola!';
      return;
    }

    try {
      this.isLoading = true;
      const user = await this.authService.register(
        this.email, 
        this.password, 
        this.first_name, 
        this.last_name,
        this.isTeacher
      );
      
      if (user) {
        this.successMessage = 'Rejestracja zakończona sukcesem!';
        setTimeout(() => {
          this.router.navigate([this.isTeacher ? '/teacher-login' : '/login']);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Błąd podczas rejestracji:', error);
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'Ten adres email jest już zajęty.';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Nieprawidłowy format adresu email.';
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = 'Hasło jest zbyt słabe. Użyj minimum 6 znaków.';
      } else {
        this.errorMessage = 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
  

