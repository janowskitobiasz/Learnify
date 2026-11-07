import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './users/dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ProfileSettingsComponent } from './users/profile-settings/profile-settings.component';
import { GameListComponent } from './games/game-list/game-list.component';
import { GameComponent } from './games/game/game.component';
import { QuizQuestionsComponent } from './games/quiz-questions/quiz-questions.component';
import { LeaderboardComponent } from './games/leaderboard/leaderboard.component';
import { GameSummaryComponent } from './games/game-summary/game-summary.component';
import { ClassManagementComponent } from './teachers/class-management/class-management.component';
import { UserManagementComponent } from './teachers/user-management/user-management.component';
import { GameStatsComponent } from './games/game-stats/game-stats.component';
import { UserHelpComponent } from './users/user-help/user-help.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TermsComponent } from './rules/terms/terms.component';
import { PrivacypolicyComponent } from './rules/privacypolicy/privacypolicy.component';
import { ForgotpasswordComponent } from './auth/forgotpassword/forgotpassword.component';
import { TeacherloginComponent } from './auth/teacherlogin/teacherlogin.component';
import { TeacherregisterComponent } from './auth/teacherregister/teacherregister.component';
import { MainComponent } from './main/main.component';
import { AuthGuard } from './auth/auth.guard';
import { LoggedGuard } from './auth/logged.guard';
import { StudentInvitesComponent } from './components/student-invites/student-invites.component';
import { TeacherAuthGuard } from './auth/teacher-auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'main', component: MainComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'teacher/login', component: TeacherloginComponent },
  { path: 'teacher/register', component: TeacherregisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileSettingsComponent, canActivate: [AuthGuard] },
  { path: 'games', component: GameListComponent, canActivate: [AuthGuard] },
  { path: 'games/play', component: GameComponent, canActivate: [AuthGuard] },
  { path: 'games/quiz', component: QuizQuestionsComponent, canActivate: [AuthGuard] },
  { path: 'games/summary', component: GameSummaryComponent, canActivate: [AuthGuard] },
  { path: 'games/leaderboard', component: LeaderboardComponent, canActivate: [AuthGuard] },
  { path: 'games/stats', component: GameStatsComponent, canActivate: [AuthGuard] },
  { path: 'teacher/classes', component: ClassManagementComponent, canActivate: [TeacherAuthGuard] },
  { path: 'teachers/user-management', component: UserManagementComponent, canActivate: [AuthGuard] },
  { path: 'help', component: UserHelpComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy-policy', component: PrivacypolicyComponent },
  { path: 'forgot-password', component: ForgotpasswordComponent, canActivate: [LoggedGuard] },
  { path: 'invites', component: StudentInvitesComponent, canActivate: [AuthGuard] },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
