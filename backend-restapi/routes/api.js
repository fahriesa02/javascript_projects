// import express 
import express from 'express';
import AuthController from '../controllers/authController.js';


// pasang router endpoint dari webserver
const router = express.Router();

// router dari authcontroller untuk validasi register dan login
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken)


// export variabel router untuk dipake file lain
export default router;