const express=require('express')
const router= new express.Router()
const controller=require('../controllers/studentcontroller')

router.post("/create-student", controller.createStudent)
router.get("/search-student", controller.searchStudents);
router.get("/date-summary", controller.getDateWiseHistory);
router.get("/view-all", controller.getAllStudents);
module.exports=router