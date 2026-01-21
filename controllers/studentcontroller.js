const Student=require('../models/student')

exports.createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);

    student.history.push({
      action: "Student created"
    });

    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};