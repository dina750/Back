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
    twoFactorAuth
} from '../controllers/userController.js'
import twofactor from '../utils/twofactor.js'
import { protect, admin } from './../middleware/authMiddleware.js'

router.route('/').post(registerUser).get(protect, admin, getUsers)
router.post('/login', authUser)
router.route('/second').post(twoFactorAuth)
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile)
router
    .route('/:id')
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser)

export default router