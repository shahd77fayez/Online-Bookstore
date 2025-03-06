import userModel from "../DB/models/user.model.js";
import {
  generateToken,
  verifyToken,
} from "../middlewares/GenerateAndVerifyToken.js";
import { addToBlackList } from "../middlewares/TokenBlackList.js";
import { ErrorClass } from "../middlewares/ErrorClass.js";
import sendEmail, { createHtml } from "../middlewares/email.js";
import StatusCodes from "http-status-codes";
import { nanoid } from "nanoid";
import CryptoJS from "crypto-js";
import bcrypt from "bcryptjs";
//1]==================== Sign Up =====================
//=============( hash password , encrypt phone )=================
export const signup = async (req, res, next) => {
  const isEmailExist = await userModel.findOne({ email: req.body.email });
  if (isEmailExist) {
    return next(
      new ErrorClass(
        `This email ${req.body.email} already exist`,
        StatusCodes.CONFLICT
      )
    );
  }
  req.body.phone = CryptoJS.AES.encrypt(
    req.body.phone,
    process.env.ENCRYPTION_KEY
  ).toString();
  //req.body.password = hash(req.body.password)
  const code = nanoid(6);
  req.body.code = code;
  const user = await userModel.create(req.body);

  // Send email after successful user creation
  const html = createHtml("confirmation", `code is: ${code}`);

  sendEmail({ to: req.body.email, subject: "Email Confirmation", html });
  res
    .status(StatusCodes.CREATED)
    .json({ message: "User added successfully", user });
};
//2]==================== Confirm Email =======================
export const confirmEmail = async (req, res, next) => {
  const { email, code } = req.body;
  const isEmailExist = await userModel.findOne({ email });
  if (!isEmailExist) {
    return next(ErrorClass(`Email is Not Found`, StatusCodes.NOT_FOUND));
  }
  if (code != isEmailExist.code) {
    return next(new ErrorClass(`In-valid Code`, StatusCodes.BAD_REQUEST));
  }
  // to prevent user from using the same code again
  const newCode = nanoid(6);
  const confirmedUser = await userModel.updateOne(
    { email },
    { isConfirmed: true, code: newCode }
  );
  res
    .status(StatusCodes.OK)
    .json({ message: "Successfully Confirmed", confirmedUser });
};
//3]==================== Sign in ======================
// =====================(must be confirmed and not deleted)==============
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({
    email,
    isConfirmed: true,
    isDeleted: false,
  });
  //Email Checking
  if (!user) {
    return next(new ErrorClass(`Invalid-Credentials`, StatusCodes.NOT_FOUND));
  }
  //Password Checking
  const passcheck = await user.comparePassword(password, user.password);
  if (!passcheck) {
    return next(new ErrorClass(`Invalid-Credentials`, StatusCodes.NOT_FOUND));
  }
  const payload = {
    id: user._id,
    email: user.email,
  };
  const userToken = generateToken({ payload });
  res
    .status(StatusCodes.ACCEPTED)
    .json({ message: "Valid Credentials", userToken });
};
//4]==================== Forgrt Password ==========================
export const sendCode = async (req, res, next) => {
  const { email } = req.body;
  const isEmailExist = await userModel.findOne({ email });
  if (!isEmailExist) {
    return next(new ErrorClass(`User is not found`, StatusCodes.NOT_FOUND));
  }
  // creating new code to send via email to the user
  const code = nanoid(6);
  const expiration = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 minutes
  const html = createHtml(
    "reset",
    `Your reset code is: <b>${code}</b>. It expires in 15 minutes.`
  );

  await sendEmail({ to: req.body.email, subject: "ForgottenPassword" }, html);
  await userModel.updateOne(
    { email },
    { code, codeExpires: expiration },
    { new: true }
  );
  res.status(StatusCodes.ACCEPTED).json({ message: "Done" });
};
export const resetPassword = async (req, res, next) => {
  let { email, code, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new ErrorClass(`User is not found`, StatusCodes.NOT_FOUND));
  }
  if (code != user.code) {
    return next(new ErrorClass(`In-Valid Code`, StatusCodes.BAD_REQUEST));
  }
  // Check if code has expired
  if (user.codeExpires && user.codeExpires < new Date()) {
    return next(
      new ErrorClass(
        `Reset code expired. Request a new one.`,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  // Update password and clear reset code
  user.password = password; // No need to hash, Mongoose middleware handles it
  user.code = null;
  user.codeExpires = null;

  await user.save(); // This will trigger the hashing middleware
  res
    .status(StatusCodes.ACCEPTED)
    .json({ message: "Password reset successful" });
};
//5]==================== Change Password =================
export const changePass = async (req, res, next) => {
  const { _id } = req.user;
  if (!req.user) {
    return next(
      new ErrorClass("User is not authenticated", StatusCodes.UNAUTHORIZED)
    );
  }
  const { oldpass, newpass } = req.body;
  const userExist = await userModel.findById(_id);
  const passcheck = await userExist.comparePassword(oldpass);
  if (!passcheck) {
    return next(new ErrorClass(`Invalid Old Password`, StatusCodes.NOT_FOUND));
  }
  // Check if new password is the same as the old password
  const isSamePassword = await bcrypt.compare(newpass, userExist.password);
  if (isSamePassword) {
    return next(
      new ErrorClass(
        "New password cannot be the same as the old password",
        StatusCodes.CONFLICT
      )
    );
  }

  // Update password and save (Mongoose will hash it automatically)
  userExist.password = newpass;
  await userExist.save(); // This will trigger the password hashing middleware
  res.status(200).json({ message: "Password updated successfully" });
};
//6]==================== Delete User ===================
export const softDelete = async (req, res, next) => {
  //console.log(req.user)
  const { _id } = req.user;
  if (!req.user) {
    return next(
      new ErrorClass("User is not Authenticated", StatusCodes.UNAUTHORIZED)
    );
  }
  
  const { authorization } = req.headers;
  if (!authorization) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authorization header missing" });
  }
  const token = authorization;
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Token missing" });
  }
  addToBlackList(token);

  const user = await userModel.findByIdAndUpdate(
    { _id },
    { isDeleted: true },
    { new: true }
  );
  return res.status(StatusCodes.OK).json({ message: "Done", user });
};
//7]==================== Update User ===================
export const UpdateUser = async (req, res, next) => {
  const { _id } = req.user;
  if (!req.user) {
    return next(
      new ErrorClass("User is not authenticated", StatusCodes.UNAUTHORIZED)
    );
  }
  const userExist = await userModel.findById(_id);
  if (req.body.email != userExist.email) {
    const code = nanoid(6);
    const html = createHtml(
      "confirmation",
      `Your new confirmation code is: <b>${code}</b>`
    );
    await sendEmail({
      to: userExist.email,
      subject: "New Confirmation Email",
      html,
    });
    req.body.code = code;
    req.body.isConfirmed = false;
  }
  const user = await userModel.findByIdAndUpdate({ _id }, req.body, {
    new: true,
  });
  res.status(200).json({ message: "Done", user });
};
//8]==================== Log out ========================
export const logout = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authorization header missing" });
  }
  const token = authorization;
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Token missing" });
  }
  addToBlackList(token);
  res.status(StatusCodes.OK).json({ message: "Logged out successfully" });
};

// ============= Default Admin Addition ======================
export const createDefaultAdmins = async () => {
  const defaultAdmins = [
    { email: "admin1@example.com", password: "123456", role: "Admin" },
    { email: "admin2@example.com", password: "abcdef", role: "Admin" },
    { email: "admin3@example.com", password: "1z3y5x", role: "Admin" },
  ];
  try {
    for (const admin of defaultAdmins) {
      const existingAdmin = await userModel.findOne({ email: admin.email });

      if (!existingAdmin) {
        const newAdmin = new userModel(admin);
        await newAdmin.save();
        console.log(`Admin ${admin.email} created successfully`);
      } else {
        console.log(`Admin ${admin.email} already exists`);
      }
    }
  } catch (error) {
    console.error("Error creating default admins:", error);
  }
};