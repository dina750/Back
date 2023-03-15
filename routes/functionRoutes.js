import express from 'express';
const functionRouter = express.Router();

import { 
   
    forget_password,
    confirmUserAccount, 
    resetPassword,
    updatePassword,
} from '../controllers/userController.js';



// forget password route
functionRouter.post('/forget-password', forget_password);

// update password route
functionRouter.post('/update-password', updatePassword);

// confirm user account
functionRouter.get('/confirm/:token', confirmUserAccount);

// reset password route
functionRouter.get('/:id/:token', resetPassword);

export default functionRouter;
