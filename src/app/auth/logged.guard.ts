import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const user = await this.authService.getCurrentUser();
    
    if (user) {
      // If user is logged in, redirect to main dashboard
      this.router.navigate(['/main']);
      return false;
    }

    // Allow access only if user is not logged in
    return true;
  }
} 