🎵 MusicBuddy Backend

A simple Node.js + Express + SQLite backend for the MusicBuddy Android app.

📋 Features

✅ User Registration (POST /api/auth/register)
✅ User Login with JWT (POST /api/auth/login)
✅ SQLite Database
✅ Password Hashing with bcrypt
✅ CORS Enabled
🚀 Quick Start

Prerequisites

Node.js (v14 or higher)
npm
Installation

Clone or download the project

Install dependencies

npm install
Create .env file
cp .env.example .env
Update .env with your settings (optional for development)
PORT=3000
JWT_SECRET=your_secret_key_here
DATABASE_PATH=./database/musicbuddy.db
Run the Server

npm start
You should see:

🎵 MusicBuddy Backend running on port 3000
📍 Server URL: http://localhost:3000
🔗 Register endpoint: POST http://localhost:3000/api/auth/register
🔗 Login endpoint: POST http://localhost:3000/api/auth/login
🧪 Testing Endpoints

1. Register a New User

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "John",
    "surname": "Doe",
    "phone": "1234567890"
  }'
Success Response (201):

{
  "message": "User registered successfully",
  "userId": 1
}
2. Login

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
Success Response (200):

{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "John",
    "surname": "Doe",
    "phone": "1234567890",
    "bio": ""
  }
}
3. Health Check

curl http://localhost:3000/api/health
📁 Project Structure

musicbuddy-backend/
├── database/
│   └── db.js              # SQLite database initialization
├── models/
│   └── userModel.js       # User database queries
├── routes/
│   └── authRoutes.js      # Authentication endpoints
├── server.js              # Express server setup
├── package.json           # Dependencies
├── .env.example           # Environment variables template
└── README.md              # This file
🔐 Security Notes

Passwords are hashed with bcrypt (10 salt rounds)
JWT tokens expire after 24 hours
CORS is enabled for all origins (change in production)
Always use HTTPS in production
Change JWT_SECRET in .env to a strong random string
📱 Android Integration

Using Retrofit

// Create Retrofit instance
val retrofit = Retrofit.Builder()
    .baseUrl("http://localhost:3000/")
    .addConverterFactory(GsonConverterFactory.create())
    .build()

// Create API service
interface AuthService {
    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): RegisterResponse

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse
}

// Register
val response = authService.register(
    RegisterRequest(
        email = "test@example.com",
        password = "password123",
        name = "John",
        surname = "Doe",
        phone = "1234567890"
    )
)

// Login
val response = authService.login(
    LoginRequest(
        email = "test@example.com",
        password = "password123"
    )
)

// Save token
val token = response.token
// Use token in Authorization header for future requests
🚀 Next Steps

 Add authentication middleware for protected routes
 Implement user profile endpoints (GET/PUT/DELETE)
 Add input validation
 Deploy to cloud service (PythonAnywhere, Heroku, etc.)
 Add email verification
 Add password reset functionality
 Add rate limiting
📝 API Endpoints Summary

Method	Endpoint	Auth	Description
POST	/api/auth/register	No	Register new user
POST	/api/auth/login	No	Login and get JWT token
GET	/api/health	No	Health check
🐛 Troubleshooting

Port already in use:

# Change PORT in .env file
PORT=3001
Database errors:

Delete database/musicbuddy.db and restart the server
The database will be recreated automatically
CORS errors:

Make sure CORS is enabled in server.js
Check that your Android app is making requests to the correct URL
📞 Support

For issues or questions, check the console logs for detailed error messages.

Happy coding! 🎵