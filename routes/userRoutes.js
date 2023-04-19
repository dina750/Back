import express from 'express';
const router = express.Router();

import { 
    authUser, 
    getUserProfile, 
    registerUser, 
    updateUserProfile, 
    getUsers, 
    deleteUser,
    getUserById,
    updateUser,
    forgetPassword,
    confirmUserAccount, 
    resetPassword,
    updatePassword,
    
    handleUser,

} from '../controllers/userController.js';
import { protect, admin } from './../middleware/authMiddleware.js';


router.route('/')
    .post(registerUser)
    .get( getUsers);


router.post('/auth/google',handleUser);

router.post('/login', authUser);

router.route('/profile')
    .get( getUserProfile)
    .put( updateUserProfile);

router.route('/:id')
    .delete( deleteUser)
    .get( getUserById)
    .put(  updateUser);

// forget password route
router.post('/forget-password', forgetPassword);

// update password route
router.post('/:userId/update', updatePassword);

// confirm user account
router.get('/confirm/:token', confirmUserAccount);  

// reset password route
router.get('/:userId/:tokenreset', resetPassword);

export default router;
