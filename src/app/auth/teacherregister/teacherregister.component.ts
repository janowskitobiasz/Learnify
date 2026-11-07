import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TeacherService } from '../../services/teacher.service';

@Component({
  selector: 'app-teacherregister',
  templateUrl: './teacherregister.component.html',
  styleUrl: './teacherregister.component.css'
})
export class TeacherregisterComponent {
  registrationData = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    school_name: '',
    subject_taught: ''
  };
  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private teacherService: TeacherService,
    private router: Router
  ) {}

  async onSubmit() {
    this.isLoading = true;
    this.error = null;

    try {

      const authData = await this.authService.register(
        this.registrationData.email,
        this.registrationData.password,
        this.registrationData.first_name,
        this.registrationData.last_name,
        true 
      );

      if (authData && authData.user) {
        await this.teacherService.registerTeacher({
          first_name: this.registrationData.first_name,
          last_name: this.registrationData.last_name,
          email: this.registrationData.email,
          school_name: this.registrationData.school_name,
          subject_taught: this.registrationData.subject_taught
        }, authData.user.id);


        this.router.navigate(['/teacher/classes']);
      }
    } catch (error: any) {
      if (error?.message?.includes('User already registered')) {
        this.error = 'Użytkownik o tym adresie email już istnieje.';
      } else {
        this.error = 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.';
      }
      console.error('Registration error:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
