const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserService = require("../services/user.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

const SECRET_KEY = process.env.JWT_SECRET || "contactbook-super-secret-key";

exports.register = async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return next(new ApiError(400, "Email và mật khẩu không được để trống!"));
  }

  try {
    const userService = new UserService(MongoDB.client);
    
    const existingUser = await userService.findByEmail(req.body.email);
    if (existingUser) {
      return next(new ApiError(400, "Email đã được sử dụng!"));
    }

    const document = await userService.create(req.body);
    
    const { password, ...userWithoutPassword } = document;
    return res.send(userWithoutPassword);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the user")
    );
  }
};

exports.login = async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return next(new ApiError(400, "Email và mật khẩu không được để trống!"));
  }

  try {
    const userService = new UserService(MongoDB.client);
    const user = await userService.findByEmail(req.body.email);

    if (!user) {
      return next(new ApiError(401, "Không tồn tại email!"));
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return next(new ApiError(401, "Email hoặc mật khẩu không chính xác!"));
    }

    const token = jwt.sign({ id: user._id }, SECRET_KEY, {
      expiresIn: "24h",
    });

    const { password, ...userWithoutPassword } = user;
    
    return res.send({
      user: userWithoutPassword,
      token: token,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while logging in")
    );
  }
};
