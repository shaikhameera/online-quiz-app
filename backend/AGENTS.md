# Backend Agent Context

## Project Overview

This backend is a FastAPI-based Online Quiz Assessment application.

It provides:

* User registration and authentication
* Session-based login management
* Admin-only question management
* Quiz question delivery
* Quiz submission and scoring
* Result storage and tracking
* Basic application statistics

MongoDB Atlas is used as the database.

---

## Current Stack

* Framework: FastAPI
* ASGI Server: Uvicorn
* Database: MongoDB Atlas via PyMongo
* Authentication: Session-based authentication
* Password Hashing: Passlib + bcrypt
* Session Storage: Starlette SessionMiddleware
* Environment Variables: python-dotenv
* API Protection: API Key Header Authentication
* Database Driver: PyMongo

---

## Project Structure

app/

├── main.py

├── database.py

├── models/

│   ├── user.py

│   ├── question.py

│   └── quiz.py

├── routes/

│   ├── user.py

│   ├── admin.py

│   ├── questions.py

│   └── quiz.py

├── utils/

│   ├── security.py

│   ├── api_key.py

│   └── admin.py

└── test/

---

## Authentication System

### User Authentication

Authentication uses:

* Email + Password
* Session Middleware
* Server-side session storage

Logged-in user information is stored in:

```python
request.session["user"] = {
    "email": db_user["email"],
    "name": db_user["name"],
    "role": db_user["role"]
}
```

---

### API Key Protection

API requests can be protected using:

Header:

```http
X-API-Key: your_secret_key
```

Validation is handled by:

```python
app.utils.api_key.verify_api_key
```

---

### Admin Authorization

Admin-only endpoints use:

```python
app.utils.admin.admin_required
```

Checks:

* User is logged in
* User role is admin

Admin users are identified by:

```json
{
  "role": "admin"
}
```

---

## Database Design

Database:

```text
online_quiz
```

Collections:

```text
users
questions
results
```

---

### users Collection

Example:

```json
{
  "_id": "...",
  "name": "Ameera",
  "email": "ameera@gmail.com",
  "password": "hashed_password",
  "role": "user"
}
```

---

### questions Collection

Example:

```json
{
  "_id": "...",
  "question": "What is Python?",
  "options": [
    "Programming Language",
    "Browser",
    "Database",
    "Operating System"
  ],
  "correct_answer": "Programming Language"
}
```

---

### results Collection

Example:

```json
{
  "_id": "...",
  "user_email": "ameera@gmail.com",
  "user_name": "Ameera",
  "score": 8,
  "total_questions": 10,
  "percentage": 80.0,
  "submitted_at": "2026-06-26T16:30:00",
  "answers": [
    {
      "question_id": "...",
      "selected_answer": "Programming Language",
      "correct_answer": "Programming Language",
      "is_correct": true
    }
  ]
}
```

---

## Current API Routes

### Admin

#### Get All Users

```http
GET /admin/users
```

Returns all users.

---

#### Get All Questions

```http
GET /admin/questions
```

Returns all questions including correct answers.

---

#### Add Question

```http
POST /admin/questions
```

Creates a new question.

---

#### Update Question

```http
PUT /admin/questions/{question_id}
```

Updates an existing question.

---

#### Delete Question

```http
DELETE /admin/questions/{question_id}
```

Deletes a question.

---

#### Get Results

```http
GET /admin/results
```

Returns all submitted quiz results.

---

#### Get Stats

```http
GET /admin/stats
```

Returns:

```json
{
  "total_users": 0,
  "total_questions": 0,
  "total_results": 0
}
```

---

### User

#### Register

```http
POST /user/register
```

Creates a user account.

---

#### Login

```http
POST /user/login
```

Authenticates user and creates session.

---

#### Logout

```http
GET /user/logout
```

Clears current session.

---

#### Current User

```http
GET /user/me
```

Returns current logged-in user.

---

### Quiz

#### Get Quiz Questions

```http
GET /quiz/questions
```

Returns questions without exposing answers.

Example:

```json
[
  {
    "id": "...",
    "question": "...",
    "options": []
  }
]
```

---

#### Submit Quiz

```http
POST /quiz/submit
```

Calculates score.

Stores result.

Returns:

```json
{
  "result_id": "...",
  "score": 8,
  "total_questions": 10,
  "percentage": 80
}
```

---

## Environment Variables

Required:

```env
MONGO_URI=your_mongodb_connection_string

SECRET_KEY=your_session_secret

API_SECRET_KEY=your_api_secret
```

---

## Running The Backend

```bash
myenv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

---

## Current Status

Implemented:

* User Registration
* User Login
* User Logout
* Current User Endpoint
* Session Authentication
* API Key Protection
* Admin Authorization
* Question CRUD
* Quiz Question Retrieval
* Quiz Submission
* Result Storage
* Statistics Endpoint

Pending:

* GET /quiz/history
* GET /quiz/result/{result_id}
* Result Filtering
* Leaderboard
* Email Functionality
* Pagination
* Unit Tests

---

## Agent Guidance

When modifying this backend:

* Keep session-based authentication.
* Do not introduce JWT unless explicitly requested.
* Use the centralized database connection from database.py.
* Store quiz results in results_collection.
* Admin endpoints must remain protected by admin_required.
* Quiz question endpoints must never expose correct answers.
* Maintain current request/response shapes unless a change is intentionally introduced.
* Prefer reusable helper functions for ObjectId validation and common logic.
