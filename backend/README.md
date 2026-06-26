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
