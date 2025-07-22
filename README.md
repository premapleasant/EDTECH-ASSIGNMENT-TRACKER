# Assignment Tracking System (EdTech Platform)

## 🎯 Objective
A simplified assignment tracking system that allows teachers to post assignments and students to submit them.

## 🔧 Tech Stack
- Frontend: HTML, CSS, JS
- Backend: Node.js (Express) OR Python (Flask/FastAPI/Django)
- Database: MySQL or SQLite

## 📚 Features
- Teacher signup/login and post assignments
- Student signup/login and submit assignments
- Teachers can view all submissions
- Role-based access control (RBAC)
- JSON API responses

## 📁 API Endpoints
| Method | Endpoint                | Access   | Description                     |
|--------|-------------------------|----------|---------------------------------|
| POST   | /register               | Public   | Register (student/teacher)      |
| POST   | /login                  | Public   | Login with role                 |
| POST   | /assignments            | Teacher  | Create assignment               |
| POST   | /assignments/:id/submit| Student  | Submit assignment               |
| GET    | /assignments/:id/view   | Teacher  | View all submissions            |

## 📝 Future Scaling Suggestions
- Use Redis for session management
- Use S3/GCS for file uploads
- Add pagination, search, analytics
- Deploy with Docker, CI/CD

## 🧪 API Documentation
Swagger/OpenAPI support coming soon!
