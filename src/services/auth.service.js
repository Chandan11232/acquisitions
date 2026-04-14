import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '#config/database.js';
import { users } from '#models/User.model.js';
import logger from '#config/logger.js';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (e) {
    logger.error(`Invalid password: ${e}`);
    throw new Error('Error hashing', { cause: e });
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (e) {
    logger.error(`Error comparing password: ${e.message}`);
    throw new Error('Error comparing password', { cause: e });
  }
};

export const authenticateUser = async (email, password) => {
  try {
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUsers.length === 0) {
      throw new Error('Email doesn\'t exists');
    }

    const [existingUser] = existingUsers;
    const isPasswordValid = await comparePassword(password, existingUser.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    logger.info(`User authenticated successfully: ${existingUser.email}`);
    return existingUser;
  } catch (e) {
    logger.error(`Error authenticating user: ${e.message}`);
    throw e;
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    // 1. MUST await the query to get the actual data
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // 2. Check the length of the returned array
    if (existingUsers.length > 0) {
      throw new Error('User with this email already exists');
    }

    const password_hash = await hashPassword(password);

    // 3. Insert and capture the result
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: password_hash, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.createdAt,
      });

    logger.info(`User ${newUser.email} created successfully`);

    // 4. CRITICAL: You must return the newUser object back to the controller
    return newUser;
  } catch (e) {
    logger.error(`Error creating the user: ${e.message}`);
    throw e;
  }
};
