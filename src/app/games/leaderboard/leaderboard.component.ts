import { Component, OnInit } from '@angular/core';
import { LeaderboardService, LeaderboardEntry } from '../../services/leaderboard.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  leaderboardEntries: LeaderboardEntry[] = [];
  userScores: LeaderboardEntry[] = [];
  selectedSubject: string | null = null;
  isLoading = false;
  error: string | null = null;
  classId: string | null = null;
  subjects = [
    'Język angielski',
    'Matematyka',
    'Fizyka',
    'Chemia',
    'Geografia',
    'Historia'
  ];

  constructor(
    private leaderboardService: LeaderboardService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.classId = params['classId'] || null;
      this.selectedSubject = params['subject'] || null;
      this.loadLeaderboard();
    });

    try {
      const userData = await this.authService.getUserData();
      if (userData) {
        this.userScores = await this.leaderboardService.getUserScores(userData.id);
      }
    } catch (error) {
      console.error('Error loading user scores:', error);
      this.error = 'Nie udało się załadować twoich wyników.';
    }
  }

  async loadLeaderboard() {
    this.isLoading = true;
    this.error = null;

    try {
      this.leaderboardEntries = await this.leaderboardService.getLeaderboard(
        this.selectedSubject || undefined,
        this.classId || undefined
      );
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      this.error = 'Nie udało się załadować tablicy wyników.';
    } finally {
      this.isLoading = false;
    }
  }

  onSubjectChange() {
    this.loadLeaderboard();
  }

  getScorePercentage(entry: LeaderboardEntry): number {
    return (entry.score / entry.total_questions) * 100;
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'badge bg-success';
      case 'medium': return 'badge bg-warning';
      case 'hard': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getDifficultyLabel(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'Łatwy';
      case 'medium': return 'Średni';
      case 'hard': return 'Trudny';
      default: return difficulty;
    }
  }

  getStudentName(entry: LeaderboardEntry): string {
    if (entry.user_first_name && entry.user_last_name) {
      return `${entry.user_first_name} ${entry.user_last_name}`;
    }
    return 'Unknown Student';
  }
}
