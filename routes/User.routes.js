import express from "express";
import {registerUser,verifyUser,logIn,getMe, logOut} from "../controller/User.controller.js"
import { isLoggin } from "../middleware/User.middelware.js";

const router = express.Router();

router.post('/register',registerUser)
router.get('/verify/:token',verifyUser)
router.post('/logIn',logIn)
router.get('/profile',isLoggin,getMe)
router.post('/logOut',isLoggin,logOut)

export default router;