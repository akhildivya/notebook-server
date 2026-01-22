const express=require('express')
const router= new express.Router()
const controller=require('../controllers/studentcontroller')

router.post("/create-student", controller.createStudent)
router.get("/search-student", controller.searchStudents);

module.exports=router