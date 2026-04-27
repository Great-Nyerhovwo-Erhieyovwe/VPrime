import express from "express";
import { sendOtp, verifyOtp, login, me } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/me', authenticate, me);
router.get('/', (req, res) => {
    res.send('Auth route is live...!')
})

export default router;
