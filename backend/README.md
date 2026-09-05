# Online Quiz System

A mini-project built using:

* Frontend: React
* Backend: FastAPI
* Database: MongoDB Atlas

## Features

### User

* Register
* Login
* Logout
* Attempt Quiz
* View Score
* Receive Score via Email

### Admin

* Add Questions
* Edit Questions
* Delete Questions
* View Quiz Results

## Project Structure

backend/

├── app/

│   ├── main.py

│   ├── database.py

│   ├── models/

│   ├── routes/

│   └── utils/

├── .env

├── requirements.txt

└── README.md

---

## Setup

### Clone Project

```bash
git clone <repository-url>
cd backend
```

### Create Virtual Environment

```bash
python -m venv myenv
```

### Activate Virtual Environment

Windows:

```bash
myenv\Scripts\activate
```

Mac/Linux:

```bash
source myenv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
MONGO_URI=your_mongodb_connection_string
```

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

---

## Running the Application

Using Uvicorn:

```bash
uvicorn app.main:app --reload
```

Or using FastAPI CLI:

```bash
fastapi dev app/main.py
```

Server will start at:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

ReDoc Documentation:

```text
http://127.0.0.1:8000/redoc
```

---

## Current APIs

### Authentication

POST /register

POST /login

GET /logout

GET /me

---

## Database

MongoDB Atlas

Collections:

* users
* questions
* results

---

## Tech Stack

Backend:

* FastAPI
* PyMongo
* Passlib
* Session Middleware

Database:

* MongoDB Atlas

Frontend:

* React

---

## Author

Ameera Shaikh

TY BSc Computer Science


## Subject quiz batches

Configure the current batch in Admin / Questions / Quiz Batch Settings. Add custom subject names, assign
questions to them. Each subject includes all its assigned questions. Use Remove
to exclude a subject. Names must be unique (case-insensitive), 1-100 characters. Save 1-4 distinct subjects,
a quiz name, and a duration of 1-86400 seconds. Empty duration uses 60 seconds.
Selection uses subject order and question ID order. Starting a batch fails with a
clear message if there are no questions for a configured subject.

### API and storage changes

- GET/PUT /admin/quiz-config: admin-only configuration with quiz_name,
  nullable duration_seconds, subjects [{name}], and available_subjects.
- Admin question create/update/list supports nullable subject.
- POST /quiz/start: authenticated, returns attempt_id, quiz_name, duration_seconds,
  expires_at, and selected questions without answers.
- POST /quiz/submit: accepts attempt_id and answers; grades the user's question
  snapshot, counts unanswered questions, and saves one result per attempt.
  Repeated submissions return the saved result.
- Submission, history, and admin results consistently return quiz_name.

MongoDB creates quiz_settings and quiz_attempts on first write. No destructive
migration is needed. Until configuration is saved, all old questions remain
playable. Assign unassigned questions to subjects in the editor to include them
in a configured batch. Old results receive the fallback name General Quiz; new
results retain the name captured at quiz start after later admin edits.
The old GET /quiz/questions API remains available. Legacy submissions without an
attempt ID are accepted only before a subject batch is configured.

The browser enforces the countdown and automatically submits at expiry, with
manual retry after network failure. It is not a tamper-proof server exam timer.

Subject choices now come from the saved batch, with no predefined names. Existing
subject configurations remain valid. Renaming/removing a subject does not change
question assignments; reassign those questions explicitly in the admin editor.

Legacy question_count settings are ignored; saving configuration removes them.
Existing in-progress attempts retain their original question snapshots.
