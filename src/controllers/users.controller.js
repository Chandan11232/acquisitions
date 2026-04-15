import logger from '#config/logger.js';
import {
  deleteUser as deleteUserService,
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
} from '#services/users.service.js';
import {
  updateUserSchema,
  userIdSchema,
} from '#validations/users.validation.js';
import { formatValidationError } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users...');
    const allUsers = await getAllUsers();
    return res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const paramsValidation = userIdSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramsValidation.error),
      });
    }

    const { id } = paramsValidation.data;
    logger.info(`Getting user with id ${id}`);
    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (e) {
    logger.error('Error in getUserById controller', e);
    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const paramsValidation = userIdSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramsValidation.error),
      });
    }

    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const { id } = paramsValidation.data;
    const updates = bodyValidation.data;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const isAdmin = currentUser.role === 'admin';
    const isOwner = Number(currentUser.id) === id;

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: 'You can only update your own account' });
    }

    if (!isAdmin && updates.role) {
      return res
        .status(403)
        .json({ message: 'Only admins can update user role' });
    }

    logger.info(`Updating user with id ${id}`);
    const updatedUser = await updateUserService(id, updates);

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error('Error in updateUser controller', e);
    if (e.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }
    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const paramsValidation = userIdSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramsValidation.error),
      });
    }

    const { id } = paramsValidation.data;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const isAdmin = currentUser.role === 'admin';
    const isOwner = Number(currentUser.id) === id;
    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own account' });
    }

    logger.info(`Deleting user with id ${id}`);
    await deleteUserService(id);

    return res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (e) {
    logger.error('Error in deleteUser controller', e);
    if (e.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }
    next(e);
  }
};
