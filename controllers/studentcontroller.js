const Student = require('../models/student')

exports.createStudent = async (req, res) => {
  try {
    const { contacts = [] } = req.body;

    // 🔴 SAME STUDENT DUPLICATE PHONE CHECK
    const phones = contacts
      .map(c => c.phone)
      .filter(Boolean);

    const uniquePhones = new Set(phones);

    if (phones.length !== uniquePhones.size) {
      return res.status(400).json({
        error: "Same phone number cannot be used for multiple relations"
      });
    }
    const student = new Student(req.body);
    // update payment status
    if (student.payment) {
      student.payment.updateStatus();
    }
    student.history.push({
      action: "Student created"
    });

    await student.save();
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: "This phone number is already registered with another student"
      });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.searchStudents = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.status(200).json({ students: [] });
    }

    const searchRegex = new RegExp(q.trim(), "i"); // case-insensitive

    const students = await Student.find({
      $or: [
        { studentName: searchRegex },
        { fatherName: searchRegex },
        { motherName: searchRegex },
        { institution: searchRegex },
        { district: searchRegex },
        { classLevel: searchRegex },  // make sure this matches your schema
        { syllabus: searchRegex },
        { "contacts.phone": searchRegex }, // if contacts is an array
        { "payment.type": searchRegex },   // if payment is an array, use $elemMatch
        { "payment.status": searchRegex },
      ],
    });

    res.status(200).json({ students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // validate ObjectId
    if (!id) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    return res.status(200).json({
      message: "Student deleted successfully",
      studentId: id
    });

  } catch (error) {
    console.error("Delete student error:", error);
    return res.status(500).json({
      error: "Failed to delete student"
    });
  }
};
exports.getDateWiseHistory = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const data = await Student.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end }
        }
      },

      {
        $facet: {
          totalContacts: [{ $count: "count" }],

          totalAmount: [
            { $unwind: { path: "$payment.transactions", preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: null,
                amount: { $sum: "$payment.transactions.amount" }
              }
            }
          ],

          callbacksArranged: [
            { $match: { "callback.arranged": "Yes" } },
            { $count: "count" }
          ],

          classWise: [
            {
              $group: {
                _id: "$classLevel",
                count: { $sum: 1 }
              }
            }
          ],

          syllabusWise: [
            {
              $group: {
                _id: "$syllabus",
                count: { $sum: 1 }
              }
            }
          ],

          // ⭐ New pipeline for call logs
          callLogsByStudent: [
            { $unwind: "$callLogs" },
            {
              $match: {
                "callLogs.dateTime": { $gte: start, $lt: end }
              }
            },
            {
              $group: {
                _id: "$_id",
                studentName: { $first: "$studentName" },
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                _id: 0,
                studentId: "$_id",
                studentName: 1,
                callLogsCount: "$count"
              }
            }
          ]
        }
      }
    ]);

    const result = data[0];

    res.json({
      totalContacts: result.totalContacts[0]?.count || 0,
      totalAmountReceived: result.totalAmount[0]?.amount || 0,
      totalCallbacks: result.callbacksArranged[0]?.count || 0,
      classWise: result.classWise,
      syllabusWise: result.syllabusWise,
      // ⭐ send call log counts
      callLogsByStudent: result.callLogsByStudent || []
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(search, "i");

    const query = search
      ? {
        $or: [
          { studentName: searchRegex },
          { fatherName: searchRegex },
          { motherName: searchRegex },
          { institution: searchRegex },
          { district: searchRegex },
          { classLevel: searchRegex },
          { syllabus: searchRegex },
          { "payment.status": searchRegex },
          { "payment.type": searchRegex },
        ],
      }
      : {};

    const [students, total] = await Promise.all([
      Student.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments(query),
    ]);

    res.status(200).json({
      students,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

exports.getInteractions = async (req, res) => {
  const search = req.query.search || "";

  const students = await Student.find({
    studentName: { $regex: search, $options: "i" }
  })
    .select(
      "studentName fatherName motherName classLevel syllabus institution district payment contacts"
    )
    .lean();
  students.forEach(s => {
    const txns = s.payment?.transactions || [];
    s.payment = {
      ...s.payment,
      paidAmount: txns.reduce((sum, t) => sum + t.amount, 0),
    };
  });
  res.json(students);
}

exports.paymentOptions = async (req, res) => {
  const { totalAmount, amount, method, dateTime } = req.body;

  const student = await Student.findById(req.params.id);

  // 🛡 ensure payment object exists
  if (!student.payment) {
    student.payment = {
      totalAmount: totalAmount || 0,
      transactions: []
    };
  }

  // set total amount if provided
  if (totalAmount) {
    student.payment.totalAmount = totalAmount;
  }

  student.payment.transactions.push({
    amount,
    method,
    dateTime
  });

  student.payment.updateStatus();

  student.history.push({ action: "Payment updated" });

  await student.save();

  res.json({
    success: true,
    payment: student.payment
  });
};


exports.callLogoptions = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.callLogs.push(req.body);

    student.history.push({
      action: "Call log added"
    });

    await student.save();
    res.json({ message: "Call log saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

