const { UserRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { Auth } = require('../utils/common');

const userRepository = new UserRepository();

async function createUser(data) {
  try {
    let user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    const jwt = Auth.createToken({
      userId: user._id,
    });
    return { jwt, user };
  } catch (error) {
    console.log(error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      'Cannot create a new User object',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function loginUser(data) {
  try {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) throw new AppError('Invalid password', StatusCodes.BAD_REQUEST);

    const passwordMatch = Auth.checkPassword(data.password, user.password);
    if (!passwordMatch)
      throw new AppError('Invalid password', StatusCodes.BAD_REQUEST);

    const jwt = Auth.createToken({
      name: user.name,
      email: user.email,
    });
    return jwt;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      'Something went wrong',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function deleteUser(id) {
  try {
    const user = await userRepository.destroy(id);
    if (!user) {
      throw new AppError(
        'no user exist for the given userId',
        StatusCodes.BAD_REQUEST
      );
    }
    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      'Cannot delete user from the database',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = {
  createUser,
  loginUser,
  deleteUser,
};