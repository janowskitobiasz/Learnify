import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { QuizService, QuizQuestion } from '../../services/quiz.service';
import { LeaderboardService } from '../../services/leaderboard.service';
import { AuthService } from '../../services/auth.service';
import { TeacherService } from '../../services/teacher.service';
import { PolishQuestionsService } from '../../services/polish-questions.service';
import { Subscription } from 'rxjs';
import { firstValueFrom } from 'rxjs';

interface Subject {
  id: number;
  name: string;
  category: number;
  key: string;
}

@Component({
  selector: 'app-quiz-questions',
  templateUrl: './quiz-questions.component.html',
  styleUrls: ['./quiz-questions.component.css']
})
export class QuizQuestionsComponent implements OnInit, OnDestroy {
  questions: QuizQuestion[] = [];
  currentQuestionIndex: number = 0;
  selectedAnswer: string | null = null;
  score: number = 0;
  showResult: boolean = false;
  shuffledAnswers: string[] = [];
  selectedSubject: number | null = null;
  selectedDifficulty: string | null = null;
  isLoading: boolean = false;
  quizStarted: boolean = false;
  errorMessage: string | null = null;
  classId: string | null = null;
  teacherMode: boolean = false;

  private subscriptions: Subscription[] = [];

  subjects: Subject[] = [
    { id: 1, name: 'Język angielski', category: 10, key: 'english' },
    { id: 2, name: 'Matematyka', category: 19, key: 'matematyka' },
    { id: 3, name: 'Fizyka', category: 17, key: 'fizyka' },
    { id: 4, name: 'Chemia', category: 17, key: 'chemia' },
    { id: 5, name: 'Geografia', category: 22, key: 'geografia' },
    { id: 6, name: 'Historia', category: 23, key: 'historia' }
  ];

  difficulties = [
    { value: 'easy', label: 'Łatwy' },
    { value: 'medium', label: 'Średni' },
    { value: 'hard', label: 'Trudny' }
  ];

  constructor(
    private quizService: QuizService,
    private polishQuestionsService: PolishQuestionsService,
    private leaderboardService: LeaderboardService,
    private teacherService: TeacherService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const paramsSub = this.route.queryParams.subscribe(params => {
      this.classId = params['classId'] || null;
      this.teacherMode = params['teacherMode'] === 'true';
    });
    this.subscriptions.push(paramsSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async startQuiz() {
    if (!this.selectedSubject || !this.selectedDifficulty) {
      this.errorMessage = 'Wybierz przedmiot i poziom trudności.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    try {
      const subject = this.subjects.find(s => s.id === this.selectedSubject);
      if (!subject) throw new Error('Nieprawidłowy przedmiot');

      console.log('Starting quiz for:', {
        subject: subject.key,
        difficulty: this.selectedDifficulty
      });

      if (subject.key === 'english') {
        const sub = this.quizService.getQuestions(subject.category, this.selectedDifficulty)
          .subscribe({
            next: (questions) => {
              this.questions = questions;
              if (this.questions.length === 0) {
                throw new Error('Nie udało się pobrać pytań. Spróbuj ponownie.');
              }
              this.shuffleAnswers();
              this.quizStarted = true;
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error starting English quiz:', error);
              this.errorMessage = 'Wystąpił błąd podczas ładowania pytań. Spróbuj ponownie.';
              this.isLoading = false;
            }
          });
        this.subscriptions.push(sub);
      } else {
        try {
          console.log('Fetching Polish questions for:', subject.key);
          const questions = await this.polishQuestionsService.getQuestions(subject.key, this.selectedDifficulty);
          
          if (!questions || questions.length === 0) {
            throw new Error('Nie udało się pobrać pytań. Spróbuj ponownie.');
          }

          console.log(`Successfully loaded ${questions.length} questions`);
          this.questions = questions;
          this.shuffleAnswers();
          this.quizStarted = true;
        } catch (error) {
          console.error('Error starting Polish quiz:', error);
          this.errorMessage = error instanceof Error ? error.message : 'Wystąpił błąd podczas ładowania pytań. Spróbuj ponownie.';
        }
      }
    } catch (error) {
      console.error('Error in startQuiz:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Wystąpił błąd podczas ładowania pytań. Spróbuj ponownie.';
    } finally {
      this.isLoading = false;
    }
  }

  private shuffleAnswers() {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    if (!currentQuestion.all_answers) {
      currentQuestion.all_answers = [
        currentQuestion.correct_answer,
        ...currentQuestion.incorrect_answers
      ];
    }
    this.shuffledAnswers = [...currentQuestion.all_answers].sort(() => Math.random() - 0.5);
  }

  selectAnswer(answer: string) {
    this.selectedAnswer = answer;
  }

  async nextQuestion() {
    if (this.selectedAnswer === null) return;

    if (this.selectedAnswer === this.questions[this.currentQuestionIndex].correct_answer) {
      this.score++;
    }

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
      this.shuffleAnswers();
    } else {
      await this.finishQuiz();
    }
  }

  private async finishQuiz() {
    this.showResult = true;
    try {
      const userData = await this.authService.getUserData();
      if (!userData) {
        this.errorMessage = 'Nie znaleziono danych użytkownika. Zaloguj się ponownie.';
        return;
      }

      // Check if user is a teacher
      if (userData.role === 'teacher') {
        this.errorMessage = 'Nauczyciele nie mogą zapisywać wyników quizów.';
        return;
      }

      const subject = this.subjects.find(s => s.id === this.selectedSubject);
      if (!subject) {
        this.errorMessage = 'Nieprawidłowy przedmiot.';
        return;
      }

      console.log('Saving score for user:', {
        userId: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        score: this.score,
        totalQuestions: this.questions.length,
        subject: subject.name,
        difficulty: this.selectedDifficulty
      });

      const result = await this.leaderboardService.addScore({
        user_id: userData.id,
        score: this.score,
        total_questions: this.questions.length,
        subject: subject.name,
        difficulty: this.selectedDifficulty || 'medium',
        class_id: this.classId,
        user_first_name: userData.first_name,
        user_last_name: userData.last_name,
        user_email: userData.email
      });

      console.log('Score saved successfully:', result);
    } catch (error) {
      console.error('Error saving score:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania wyniku.';
    }
  }

  restartQuiz() {
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.score = 0;
    this.showResult = false;
    this.quizStarted = false;
    this.errorMessage = null;
    this.selectedSubject = null;
    this.selectedDifficulty = null;
  }

  getDifficultyLabel(value: string): string {
    const difficulty = this.difficulties.find(d => d.value === value);
    return difficulty ? difficulty.label : value;
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'badge bg-success';
      case 'medium':
        return 'badge bg-warning';
      case 'hard':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getSubjectName(id: number): string {
    const subject = this.subjects.find(s => s.id === id);
    return subject ? subject.name : '';
  }

  viewLeaderboard() {
    if (this.classId) {
      this.router.navigate(['/games/leaderboard'], { queryParams: { classId: this.classId } });
    } else {
      this.router.navigate(['/games/leaderboard']);
    }
  }
}
