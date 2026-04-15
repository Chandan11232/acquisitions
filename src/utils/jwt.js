import jwt from 'jsonwebtoken';
import logger from '#config/logger.js';

export const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-please-change-in-production';

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export const jwttoken = {
  sign: (payload, options = {}) => {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        ...options,
      });
    } catch (e) {
      logger.error('Failed to sign JWT', e);
      throw e;
    }
  },
  verify: (token, options = {}) => {
    try {
      return jwt.verify(token, JWT_SECRET, options);
    } catch (e) {
      logger.error('Failed to verify JWT', e);
      throw e;
    }
  },
};
