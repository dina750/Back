import express from 'express'
const router = express.Router()

import { 
    authUser, 
    getUserProfile, 
    registerUser, 
    updateUserProfile, 
    getUsers, 
    deleteUser,
    getUserById,
    updateUser,
    forget_password,
    reset_password,
    confirmUserAccount ,

} from '../controllers/userController.js'
import { protect, admin } from './../middleware/authMiddleware.js'

router.route('/').post(registerUser).get(protect, admin, getUsers)
router.post('/login', authUser)
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile)
router
    .route('/:id')
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser)
//update password route
router.post('/forget-password',forget_password);
//Confirm user account
router.get('/confirm/:token', confirmUserAccount);



//reset password
router.get('/reset-password',reset_password)
export default router