import { Router } from "express";
import { login, register, logOut } from "../controllers/user.controller.js";
import { protectedRoute } from "../middlewares/auth.js";
import { loginLimiter } from "../utils/rateLimit.js";



const router = Router(); 

router.route('/signup').post(register);
router.route('/login').post(loginLimiter ,login);
router.route('/logout').post(protectedRoute, logOut);

export default router;