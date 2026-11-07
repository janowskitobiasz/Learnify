import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService, InviteNotification } from '../../services/notification.service';
import { TeacherService } from '../../services/teacher.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  template: `
    <div class="notifications-container" *ngIf="notifications.length > 0">
      <div class="notification" *ngFor="let notification of notifications">
        <div class="notification-content">
          <p class="mb-2">
            <strong>{{ notification.teacher_name }}</strong> zaprasza Cię do klasy
            <strong>{{ notification.class_name }}</strong>
          </p>
          <div class="notification-actions">
            <button class="btn btn-success btn-sm me-2" (click)="acceptInvite(notification.id)">
              <i class="fas fa-check me-1"></i> Akceptuj
            </button>
            <button class="btn btn-danger btn-sm" (click)="declineInvite(notification.id)">
              <i class="fas fa-times me-1"></i> Odrzuć
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1050;
      max-width: 350px;
    }

    .notification {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 15px;
      margin-bottom: 10px;
      animation: slideIn 0.3s ease-out;
    }

    .notification-content {
      margin-bottom: 10px;
    }

    .notification-actions {
      display: flex;
      gap: 10px;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: InviteNotification[] = [];
  private subscription: Subscription | null = null;

  constructor(
    private notificationService: NotificationService,
    private teacherService: TeacherService
  ) {}

  ngOnInit() {
    this.subscription = this.notificationService
      .getInviteNotifications()
      .subscribe(notifications => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async acceptInvite(inviteId: string) {
    try {
      await this.teacherService.updateInviteStatus(inviteId, 'accepted');
      await this.notificationService.clearNotification(inviteId);
    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  }

  async declineInvite(inviteId: string) {
    try {
      await this.teacherService.updateInviteStatus(inviteId, 'rejected');
      await this.notificationService.clearNotification(inviteId);
    } catch (error) {
      console.error('Error declining invite:', error);
    }
  }
} 