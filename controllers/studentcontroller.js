const Student=require('../models/student')

exports.createStudent = async (req, res) => {
  try {
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