import User from '../models/userModel.js';
import ErrorHandler from '../utils/errorHandler.js';
import asyncErrorHandler from './asyncErrorHandler.js';
import crypto from 'crypto'
import jsonwebtoken from "jsonwebtoken"


export const isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {

    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Please Login to Access", 401))
    }

    const decodedData = jsonwebtoken.verify(token, "abc123");
    req.user = await User.findById(decodedData.id);
    next();
});

export function authorizeRoles(...roles) {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed`, 403));
        }
        next();
    }
}