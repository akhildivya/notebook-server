const mongoose = require("mongoose");

/* ---------------- CONTACT ---------------- */
const contactSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  relation: {
    type: String,
    enum: ["Father", "Mother", "Guardian", "Self"]
  }
});

/* ---------------- CALLBACK ---------------- */
const callbackSchema = new mongoose.Schema({
  arranged: { type: String, enum: ["Yes", "No"], default: "No" },
  dateTime: Date,
  handler: String,
  caller: String,
  callType: { type: String, enum: ["Incoming", "Outgoing"] },
  rating: { type: Number, min: 1, max: 5 }
});

/* ---------------- CALL LOG ---------------- */
const callLogSchema = new mongoose.Schema({
  dateTime: {
    type: Date,
    required: true
  },

  handler: {
    type: String,
    required: true
  },

  caller: {
    type: String,
    required: true
  },

  callType: {
    type: String,
    enum: ["Incoming", "Outgoing"],
    required: true
  },

  duration: {
    type: Number, // in minutes
    default: 0
  },

  notes: String
});


/* ---------------- PAYMENT ---------------- */
const paymentSchema = new mongoose.Schema({
  totalAmount: { type: Number, required: true },

  transactions: [
    {
      amount: { type: Number, required: true },
      dateTime: Date,
      method: { type: String, enum: ["UPI", "Cash", "Bank Transfer"] }
    }
  ],

  type: {
    type: String,
    enum: ["Paid", "Pending"],
    default: "Pending"
  },

  status: {
    type: String,
    enum: ["Pending", "Partially Paid", "Completed"],
    default: "Pending"
  }
});


/* 🔹 KEEP EXISTING PAID LOGIC */
paymentSchema.methods.updateStatus = function () {
  const paidSum = this.transactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  if (paidSum === 0) {
    this.type = "Pending";
    this.status = "Pending";
  } else {
    this.type = "Paid";

    if (paidSum >= this.totalAmount) {
      this.status = "Completed";
    } else {
      this.status = "Partially Paid";
    }
  }
};

/* ---------------- STUDENT ---------------- */
const studentSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    fatherName: String,
    motherName: String,

    contacts: [contactSchema],

    institution: String,
    district: String,
    classLevel: String,
    syllabus: String,

    remarks: String,

    payment: paymentSchema,
    callback: [callbackSchema],
    callLogs: [callLogSchema],
    history: [
      {
        action: String,
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);
studentSchema.index(
  { "contacts.phone": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "contacts.phone": { $exists: true }
    }
  }
);

module.exports = mongoose.model("students", studentSchema);
