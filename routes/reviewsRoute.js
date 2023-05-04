import express from 'express';
import {createReview, deleteReview, editReview} from '../controllers/reviewsController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

 
router.post('/:visitId', createReview);
router.delete('/delete/:id',deleteReview);
router.put('/edit/:id',editReview);
  


export default router