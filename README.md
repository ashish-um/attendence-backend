
# Attendance Tracker API

A backend service for managing teacher accounts, classes, and student attendance records.

## API Base URL
`https://attendence-backend-zeta.vercel.app/`

## 📋 API Endpoints

### 1. Check Server Status
**GET** `/`  
**Response:** HTML page showing server status

---

### 2. Teacher Registration
**POST** `/auth/register`  
**Request Body:**
```json
{
  "email": "teacher@school.com",
  "password": "securepassword123"
}
```

**Success Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Registration successful"
}
```

---

### 3. Teacher Login
**POST** `/auth/login`  
**Request Body:** Same as registration  
**Success Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 4. Create Class
**POST** `/classes`  
**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "className": "Grade 10 Mathematics",
  "students": [
    {"name": "Alice Smith", "rollNo": "S001"},
    {"name": "Bob Johnson", "rollNo": "S002"}
  ]
}
```

**Success Response:**
```json
{
  "_id": "65a1b2c3d4e5f67890123457",
  "name": "Grade 10 Mathematics",
  "students": [...],
  "teacher": "65a1b2c3d4e5f67890123456"
}
```

---

### 5. Get Teacher's Classes
**GET** `/classes`  
**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response:**
```json
[
  {
    "_id": "65a1b2c3d4e5f67890123457",
    "name": "Grade 10 Mathematics",
    "students": [...]
  }
]
```

---

### 6. Mark Attendance
**POST** `/attendance`  
**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "classId": "65a1b2c3d4e5f67890123457",
  "absentRollNumbers": ["S001", "S003"]
}
```

**Success Response:**
```json
{
  "message": "Attendance recorded successfully"
}
```
