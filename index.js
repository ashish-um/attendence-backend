require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Root endpoint with HTML response
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Attendance Tracker API</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f0f2f5;
        }
        .container {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #2d3436;
        }
        .status {
          color: #00b894;
          font-weight: bold;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Attendance Tracker API</h1>
        <div class="status">Server is running 🟢</div>
        <p>Version: 1.0.0</p>
        <p>Environment: ${process.env.NODE_ENV || "development"}</p>
      </div>
    </body>
    </html>
  `);
});

// Models
const Teacher = mongoose.model(
  "Teacher",
  new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  })
);

const Class = mongoose.model(
  "Class",
  new mongoose.Schema({
    name: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    students: [
      {
        name: String,
        rollNo: String,
      },
    ],
  })
);

const Attendance = mongoose.model(
  "Attendance",
  new mongoose.Schema({
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    date: { type: Date, default: Date.now },
    absentStudents: [String],
  })
);

// Middleware
app.use(express.json());
app.use(cors());

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Access denied");

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.teacher = await Teacher.findById(verified._id);
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};

// Routes
app.get("/", (req, res) => {
  res.send("Attendance Tracker API");
});

// Teacher Register
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if teacher exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).send("Teacher already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create teacher
    const teacher = new Teacher({
      email,
      password: hashedPassword,
    });

    await teacher.save();

    // Create and send JWT
    const token = jwt.sign({ _id: teacher._id }, process.env.JWT_SECRET);
    res.send({
      token,
      message: "Registration successful",
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Teacher Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(400).send("Invalid credentials");

    const validPassword = await bcrypt.compare(password, teacher.password);
    if (!validPassword) return res.status(400).send("Invalid credentials");

    const token = jwt.sign({ _id: teacher._id }, process.env.JWT_SECRET);
    res.send({ token });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Create new class for teacher
app.post("/classes", authMiddleware, async (req, res) => {
  try {
    const { className, students } = req.body;
    const teacher = req.teacher;

    // Create new class
    const newClass = new Class({
      name: className,
      teacher: teacher._id,
      students: students,
    });

    // Save class and update teacher's classes
    await newClass.save();
    teacher.classes.push(newClass._id);
    await teacher.save();

    res.status(201).send(newClass);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Get Teacher's Classes
app.get("/classes", authMiddleware, async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.teacher._id });
    res.send(classes);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Mark Attendance
app.post("/attendance", authMiddleware, async (req, res) => {
  try {
    const { classId, absentRollNumbers } = req.body;

    const newAttendance = new Attendance({
      class: classId,
      absentStudents: absentRollNumbers,
    });

    await newAttendance.save();
    res.send({ message: "Attendance recorded successfully" });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Get Attendance History
app.get("/attendance/:classId", authMiddleware, async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({
      class: req.params.classId,
    }).populate("class", "name");

    res.send(attendanceRecords);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
