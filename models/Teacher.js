const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
});
