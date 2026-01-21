const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  relation: { type: String, enum: ["Father", "Mother", "Guardian", "Other"] }
});

const callbackSchema = new mongoose.Schema({
  arranged: { type: String, enum: ["Yes", "No"], default: "No" },
  dateTime: Date,
  handler: String,
  caller: String,
  callType: { type: String, enum: ["Incoming", "Outgoing"] }
});

const paymentSchema = new mongoose.Schema({
  type: { type: String, enum: ["Paid", "Agreed"] },
  totalAmount: Number,
  paidAmount: Number,
  agreedAmount: Number,
  dateTime: Date,
  method: { type: String, enum: ["UPI", "Cash", "Bank Transfer"] },
  status: { type: String, enum: ["Pending", "Completed"], default: "Pending" }
});

const studentSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: [true, "Student name is mandatory"]},
    fatherName: String,
    motherName: String,

    contacts: [contactSchema],

    institution: String,
    district: String,
    classLevel: String, // +1, +2, BTech
    syllabus: String, // CBSE, ICSE, HSE, KTU

    remarks: String,

    payment: paymentSchema,
    callback: callbackSchema,

    history: [
      {
        action: String,
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("students", studentSchema);
