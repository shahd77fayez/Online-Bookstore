import process from 'node:process';
import {StatusCodes} from 'http-status-codes';
import Jwt from 'jsonwebtoken';
import userModel from '../DB/models/user.model.js';
import {isTokenBlackListed} from './TokenBlackList.js';

export const roles = {
  admin: 'Admin',
  user: 'User'
};

Object.freeze(roles);

export const auth = () => {
  return async (req, res, next) => {
    try {
      const {authorization} = req.headers;
      console.log(authorization);

      if (!authorization) {
        return res.status(StatusCodes.UNAUTHORIZED).json({message: 'Please login first'});
      }

      // const token = authorization.split(' ')[1];  // Extract the token from the 'Bearer <token>' format
      const token = authorization.startsWith('Bearer ')
        ? authorization.slice(7).trim()
        : authorization.trim();
      console.log(token);
      if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({message: 'Token missing'});
      }

      // Check if token is blacklisted (await async function)
      const blacklisted = await isTokenBlackListed(token); // Use await here
      if (blacklisted) {
        return res.status(StatusCodes.UNAUTHORIZED).json({message: 'Token is blacklisted'});
      }

      // Verify token
      const decoded = Jwt.verify(token, process.env.TOKEN_SIGNATURE);
      if (!decoded?.id) {
        return res.status(StatusCodes.UNAUTHORIZED).json({message: 'Invalid token payload'});
      }
      // Fetch user from database
      const authUser = await userModel.findById(decoded.id).select('-password');
      if (!authUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({message: 'Account not registered'});
      }

      // Attach user to request object
      req.user = authUser;
      next();
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({message: 'Invalid or expired token', error: error.message});
    }
  };
};
