import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuizQuestion } from './quiz.service';
import { firstValueFrom } from 'rxjs';

interface QuestionSet {
  easy: QuizQuestion[];
  medium: QuizQuestion[];
  hard: QuizQuestion[];
}

@Injectable({
  providedIn: 'root'
})
export class PolishQuestionsService {
  constructor(private http: HttpClient) {}

  async getQuestions(subject: string, difficulty?: string): Promise<QuizQuestion[]> {
    try {
      console.log(`Fetching questions for subject: ${subject}, difficulty: ${difficulty}`);

      if (!subject) {
        throw new Error('Nie wybrano przedmiotu.');
      }

      // Log the query parameters
      console.log('Query parameters:', {
        subject: subject,
        difficulty: difficulty?.toLowerCase()
      });

      // Load questions from JSON file
      const questions = await firstValueFrom(
        this.http.get<QuestionSet>(`/assets/questions/${subject}.json`)
      );

      if (!questions) {
        throw new Error(`Brak dostępnych pytań dla przedmiotu "${subject}".`);
      }

      // Get questions for the selected difficulty
      const difficultyQuestions = questions[difficulty?.toLowerCase() as keyof QuestionSet];

      if (!difficultyQuestions || difficultyQuestions.length === 0) {
        throw new Error(`Brak dostępnych pytań dla przedmiotu "${subject}" na poziomie "${difficulty}".`);
      }

      // Randomly select questions and shuffle answers
      const shuffled = [...difficultyQuestions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(10, shuffled.length));

      const mappedQuestions = selected.map(q => ({
        question: q.question,
        correct_answer: q.correct_answer,
        incorrect_answers: q.incorrect_answers,
        difficulty: q.difficulty,
        all_answers: [q.correct_answer, ...q.incorrect_answers].sort(() => Math.random() - 0.5)
      }));

      console.log(`Successfully loaded ${mappedQuestions.length} questions`);
      return mappedQuestions;

    } catch (error) {
      console.error('Error in getQuestions:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Wystąpił nieoczekiwany błąd podczas pobierania pytań. Spróbuj ponownie później.');
    }
  }
} 