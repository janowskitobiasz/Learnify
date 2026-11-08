# EduSpark

## O projekcie
EduSpark to platforma edukacyjna skierowana do uczniów szkół podstawowych, łącząca naukę z elementami grywalizacji i zdrowej rywalizacji. Aplikacja umożliwia uczniom utrwalanie wiedzy poprzez interaktywne quizy, a nauczycielom – zarządzanie klasami, zadawanie materiałów oraz monitorowanie postępów uczniów.

Projekt tworzony jest samodzielnie.

- **Status projektu:** Wersja demonstracyjna w fazie aktywnego rozwoju (Proof of Concept / Wersja Poglądowa).
- **Live Demo:** [eduspark1111.netlify.app](https://eduspark1111.netlify.app)
- **Baza danych:** Supabase
- **Ważne:** Projekt nie jest finalnie skończony, jest to wersja demonstracyjna tylko i wyłącznie skierowana do podstawowych testów działania logiki działania aplikacji, która dopiero jest rozwijana.
---

## Architektura i Technologie
* **Frontend:** Angular
* **Baza Danych:** Supabase (zarządzanie bazą danych, uwierzytelnianie)
* **Hosting:** Netlify

---

## Funkcjonalności

### Panel Ucznia
* **Grywalizacja i Quizy:** Wybór przedmiotów oraz poziomu trudności, zróżnicowane pule pytań i system punktacji. Obecnie wspierany jest tryb quizu jednokrotnego wyboru (w planach rozwój o dodatkowe mechaniki gier).
* **Tablica Wyników (Leaderboard):** Ogólnodostępny ranking wyników (w planach filtrowanie w obrębie konkretnych klas).
* **Zarządzanie profilem i zaproszeniami:** Odbieranie zaproszeń do klas tworzonych przez nauczycieli oraz zarządzanie kontem.
* *Uwaga:* Prezentowane w statystykach dane mają charakter demonstracyjny.

### Panel Nauczyciela
* **Zarządzanie klasami i przedmiotami:** Tworzenie i przypisywanie klas do konkretnych przedmiotów (np. Chemia - klasa 5c).
* **System zaproszeń:** Rejestrowanie i zapraszanie uczniów do klas za pomocą adresu e-mail.
* **Monitorowanie wyników:** Podgląd i filtrowanie wyników uczniów należących do danej klasy.

---

## Instrukcja testowania aplikacji

Aby ułatwić ocenę funkcjonalności systemu, udostępniono dedykowane konta testowe dla obu ról użytkowników.

### 1. Konto Ucznia
Logowanie dla uczniów jest w pełni publiczne i dostępne bezpośrednio z poziomu panelu logowania.

* **Login:** `karolak@test.com`
* **Hasło:** `zaq1@wsx`

### 2. Konto Nauczyciela
Panel nauczyciela jest ukryty pod zabezpieczeniem systemowym w celach demonstracyjnych. 

* **Instrukcja logowania:** 
  1. Przejdź do widoku logowania.
  2. Kliknij trzykrotnie w nagłówek/napis **"EduSpark"**, aby odblokować formularz logowania dla nauczyciela.
* **Dane dostępowe:**
  * **Login:** `nowak@test.com`
  * **Hasło:** `zaq1@wsx`

---

## Planowany rozwój (Roadmap)
* Wprowadzenie zaawansowanych filtrów rankingowych dla klas.
* Rozbudowa modułu gier o dodatkowe mechaniki edukacyjne inspirowane trendami wśród uczniów szkół podstawowych.
* Poszerzenie bazy pytań i przedmiotów szkolnych.

---

