import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth/auth.guard';
import { TeacherAuthGuard } from './auth/teacher-auth.guard';

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
import { PolishQuestionsService } from './services/polish-questions.service';
import { StudentInvitesComponent } from './components/student-invites/student-invites.component';
import { NotificationsComponent } from './components/notifications/notifications.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    HomeComponent,
    ProfileSettingsComponent,
    GameListComponent,
    GameComponent,
    QuizQuestionsComponent,
    LeaderboardComponent,
    GameSummaryComponent,
    ClassManagementComponent,
    UserManagementComponent,
    GameStatsComponent,
    UserHelpComponent,
    PageNotFoundComponent,
    TermsComponent,
    PrivacypolicyComponent,
    ForgotpasswordComponent,
    TeacherloginComponent,
    TeacherregisterComponent,
    MainComponent,
    StudentInvitesComponent,
    NotificationsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    PolishQuestionsService,
    AuthGuard,
    TeacherAuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
