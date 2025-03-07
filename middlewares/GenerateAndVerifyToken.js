import process from 'node:process';
import Jwt from 'jsonwebtoken';

export const generateToken = ({payload = {}, signature = process.env.TOKEN_SIGNATURE} = {}) => {
  const token = Jwt.sign(payload, signature, {expiresIn: '1d'});
  return token;
};

export const verifyToken = ({token, signature = process.env.TOKEN_SIGNATURE} = {}) => {
  const decoded = Jwt.verify(token, signature);
  return decoded;
};
