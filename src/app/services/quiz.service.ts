import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

export interface QuizQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  all_answers?: string[];
  difficulty: string;
}

export interface QuizResponse {
  response_code: number;
  results: QuizQuestion[];
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly apiUrl = 'https://opentdb.com/api.php';

  constructor(private http: HttpClient) {}

  getQuestions(category: number, difficulty?: string): Observable<QuizQuestion[]> {
    const params: any = {
      amount: 10,
      type: 'multiple'
    };

    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;

    return this.http.get<QuizResponse>(this.apiUrl, { params }).pipe(
      map(response => {
        if (response.response_code !== 0) {
          throw new Error('Nie udało się pobrać pytań');
        }
        return response.results.map(q => ({
          question: this.decodeHtmlEntities(q.question),
          correct_answer: this.decodeHtmlEntities(q.correct_answer),
          incorrect_answers: q.incorrect_answers.map(a => this.decodeHtmlEntities(a)),
          difficulty: q.difficulty
        }));
      }),
      catchError(error => {
        console.error('Błąd podczas pobierania pytań:', error);
        return throwError(() => new Error('Nie udało się pobrać pytań. Spróbuj ponownie później.'));
      })
    );
  }

  private decodeHtmlEntities(str: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  }

  getCategories(): Observable<any> {
    return this.http.get('https://opentdb.com/api_category.php').pipe(
      catchError(error => {
        console.error('Błąd podczas pobierania kategorii:', error);
        return throwError(() => new Error('Nie udało się pobrać kategorii. Spróbuj ponownie później.'));
      })
    );
  }

  // Shuffle answers for a question
  shuffleAnswers(question: QuizQuestion): string[] {
    const answers = [...question.incorrect_answers, question.correct_answer];
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
  }
} 