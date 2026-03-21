import express from "express";
import {registerUser,verifyUser,logIn} from "../controller/User.controller.js"

const router = express.Router();

router.post('/register',registerUser)
router.get('/verify/:token',verifyUser)
router.post('/logIn',logIn)

export default router;