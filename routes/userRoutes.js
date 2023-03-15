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
    confirmUserAccount, 
    resetPassword,
    updatePassword,

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

//forget password route
router.post('/forget-password',forget_password);

//reset password route
router.get('/reset-password/:token',resetPassword)

//update password route
router.post('/update-password',updatePassword)

//Confirm user account
router.get('/confirm/:token', confirmUserAccount);


export default router