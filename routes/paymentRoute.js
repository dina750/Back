import { Router } from 'express';
import { processPayment, paytmResponse, getPaymentStatus } from '../controllers/paymentController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = Router();

router.route('/payment/process').post(processPayment);
// router.route('/stripeapikey').get(isAuthenticatedUser, sendStripeApiKey);

router.route('/callback').post(paytmResponse);

router.route('/payment/status/:id').get(isAuthenticatedUser, getPaymentStatus);

export default router;