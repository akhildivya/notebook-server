const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  relation: { type: String, enum: ["Father", "Mother", "Guardian", "Other", "Self"] }
});

const callbackSchema = new mongoose.Schema({
  arranged: { type: String, enum: ["Yes", "No"], default: "No" },
  dateTime: Date,
  handler: String,
  caller: String,
  callType: { type: String, enum: ["Incoming", "Outgoing"] },
  rating: { type: Number, min: 1, max: 5 } 
});

const paymentSchema = new mongoose.Schema({
  totalAmount: Number,  // total fee
  transactions: [
    {
      amount: Number,
      dateTime: Date,
      method: { type: String, enum: ["UPI", "Cash", "Bank Transfer"] },
    }
  ],
  type: { type: String, enum: ["Paid", "Agreed"] }, // agreed vs paid
  agreedAmount: Number,
  agreedDateTime: Date,
  status: { type: String, enum: ["Pending", "Partially Paid", "Completed"], default: "Pending" }
});

// After paymentSchema definition

paymentSchema.methods.updateStatus = function () {
  const paidSum = this.transactions.reduce((sum, t) => sum + t.amount, 0);

  if (paidSum >= this.totalAmount) {
    this.status = "Completed";
  } else if (paidSum > 0) {
    this.status = "Partially Paid";
  } else {
    this.status = "Pending";
  }
};

const studentSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: [true, "Student name is mandatory"] },
    fatherName: String,
    motherName: String,

    contacts: [contactSchema],

    institution: String,
    district: String,
    classLevel: String, // +1, +2, BTech
    syllabus: String, // CBSE, ICSE, HSE, KTU

    remarks: String,

    payment: paymentSchema,
    callback: [callbackSchema],

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
