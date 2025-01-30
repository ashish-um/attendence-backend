const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  date: { type: Date, default: Date.now },
  absentStudents: [String], // Store roll numbers of absent students
});
