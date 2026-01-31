const express=require('express')
const router= new express.Router()
const controller=require('../controllers/studentcontroller')

router.post("/create-student", controller.createStudent)
router.get("/search-student", controller.searchStudents);
router.get("/date-summary", controller.getDateWiseHistory);
router.get("/view-all", controller.getAllStudents);
router.delete("/delete-student/:id", controller.deleteStudent);
router.get("/students/interactions",controller.getInteractions)
router.post("/students/:id/payment",controller.paymentOptions)
router.post("/students/:id/call-log",controller.callLogoptions)
router.get("/students/payments/:studentId", controller.getStudentPayments);
router.get("/students/calls/:studentId", controller.getStudentCalls)
router.put("/update-student/:id", controller.updateStudent);

router.get("/students/:id/call-log", controller.getCallLogs);



module.exports=router