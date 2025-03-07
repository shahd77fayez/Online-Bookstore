import userModel from "../DB/models/user.model.js";
import {generateToken} from "../middlewares/GenerateAndVerifyToken.js";
import { addToBlackList, isTokenBlackListed } from "../middlewares/TokenBlackList.js";
import { ErrorClass } from "../middlewares/ErrorClass.js";
import sendEmail, { createHtml } from "../middlewares/email.js";
import StatusCodes from "http-status-codes";
import { nanoid } from "nanoid";
import CryptoJS from "crypto-js";
import bcrypt from "bcryptjs";
import logger from "../middlewares/logger.js";
//1]==================== Sign Up =====================
//=============( hash password , encrypt phone )=================
export const signup = async (req, res, next) => {
  logger.info("Signup request received", { email: req.body.email });
  const isEmailExist = await userModel.findOne({ email: req.body.email });

  // Case 1: If user exists and is deleted, reactivate the account
  if (isEmailExist && isEmailExist.isDeleted) {
    return await reactivateUser(isEmailExist, req, res);
  }

  // Case 2: If user exists and is not deleted
  if (isEmailExist && !isEmailExist.isDeleted) {
    logger.warn(`Signup attempt with existing email: ${req.body.email}`);
    return next(
      new ErrorClass(
        `This email ${req.body.email} already exists`,
        StatusCodes.CONFLICT
      )
    );
  }

  // If no user found, create a new one
  return await createNewUser(req, res);
};

// Function to reactivate the user and update their details
const reactivateUser = async (user, req, res) => {
  user.isDeleted = false;  // Reactivate the user
  user.isConfirmed = false; // Reset confirmation status

  // Encrypt phone and update other details
  user.phone = CryptoJS.AES.encrypt(req.body.phone, process.env.ENCRYPTION_KEY).toString();
  user.name = req.body.name || user.name;
  user.address = req.body.address || user.address;

  if (req.body.password) {
    user.password = req.body.password;  // Assign the new password (hashing will be handled by pre-save hook)
  }

  // Generate new code
  const code = nanoid(6);
  user.code = code;

  await user.save(); // Save the updated user
  logger.info(`Reactivated and updated user with email: ${req.body.email}`);

  // Send confirmation email
  const html = createHtml("confirmation", `code is: ${code}`);
  await sendEmail({ to: req.body.email, subject: "Email Confirmation", html });

  res.status(StatusCodes.CREATED).json({ message: "User reactivated successfully", user });
};

// Function to create a new user
const createNewUser = async (req, res) => {
  // Encrypt the phone number
  req.body.phone = CryptoJS.AES.encrypt(req.body.phone, process.env.ENCRYPTION_KEY).toString();

  // Generate code for email confirmation
  const code = nanoid(6);
  req.body.code = code;

  // Create the new user
  const user = await userModel.create(req.body);
  logger.info("User signed up successfully", { email: req.body.email, userId: user._id });

  // Send confirmation email
  const html = createHtml("confirmation", `code is: ${code}`);
  await sendEmail({ to: req.body.email, subject: "Email Confirmation", html });

  res.status(StatusCodes.CREATED).json({ message: "User added successfully", user });
};
//2]==================== Confirm Email =======================
export const confirmEmail = async (req, res, next) => {
  logger.info("Confirm Email request received", { email: req.body.email });
  const { email, code } = req.body;
  const isEmailExist = await userModel.findOne({ email });
  if (!isEmailExist) {
    logger.error("Email not found", { email });
    return next(ErrorClass(`Email is Not Found`, StatusCodes.NOT_FOUND));
  }
  if (code != isEmailExist.code) {
    logger.warn(`Invalid confirmation code for email: ${email}`);
    return next(new ErrorClass(`In-valid Code`, StatusCodes.BAD_REQUEST));
  }
  // to prevent user from using the same code again
  const newCode = nanoid(6);
  const confirmedUser = await userModel.updateOne(
    { email },
    { isConfirmed: true, code: newCode }
  );
  logger.info(`Email confirmed successfully: ${email}`);
  res
    .status(StatusCodes.OK)
    .json({ message: "Successfully Confirmed", confirmedUser });
};
//3]==================== Sign in ======================
// =====================(must be confirmed and not deleted)==============
export const signin = async (req, res, next) => {
  logger.info("Sign-in attempt", { email: req.body.email });
  const { email, password } = req.body;
  const user = await userModel.findOne({
    email,
    isConfirmed: true,
    isDeleted: false,
  });
  //Email Checking
  if (!user) {
    console.log(user);
    logger.warn(`Failed login attempt for email: ${email}`);
    return next(new ErrorClass(`Invalid Credentials`, StatusCodes.UNAUTHORIZED));
  }
  //Password Checking
  const passcheck = await user.comparePassword(password,user.password);
  if (!passcheck) {
    console.log(passcheck);
    
    logger.warn("Invalid credentials - wrong password", { email });
    return next(new ErrorClass(`Invalid Credentials`, StatusCodes.UNAUTHORIZED));
  }
  const payload = {
    id: user._id,
    email: user.email,
  };
  const userToken = generateToken({ payload });
  logger.info(`User signed in successfully: ${email}`);
  res
    .status(StatusCodes.ACCEPTED)
    .json({ message: "Valid Credentials", userToken });
};
//4]==================== Forgrt Password ==========================
export const sendCode = async (req, res, next) => {
  logger.info("Password reset request received", { email: req.body.email });
  const { email } = req.body;
  const isEmailExist = await userModel.findOne({ email });
  if (!isEmailExist) {
    logger.warn(`Password reset requested for non-existent email: ${email}`);
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
  logger.info(`Password reset code sent to: ${email}`);
  res.status(StatusCodes.ACCEPTED).json({ message: "Done",code:code });
};
//5]==================== Reset Password =================
export const resetPassword = async (req, res, next) => {
  logger.info("Password reset request received");
  let { email, code, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    logger.warn("Password reset failed: User not found");
    return next(new ErrorClass(`User is not found`, StatusCodes.NOT_FOUND));
  }
  if (code != user.code) {
    logger.warn("Password reset failed: Invalid code");
    return next(new ErrorClass(`In-Valid Code`, StatusCodes.BAD_REQUEST));
  }
  // Check if code has expired
  if (user.codeExpires && user.codeExpires < new Date()) {
    logger.warn("Password reset failed: Code expired");
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
  logger.info(`Password reset successfully for: ${email}`); 
  res
    .status(StatusCodes.ACCEPTED)
    .json({ message: "Password reset successful" });
};
//6]==================== Change Password =================
export const changePass = async (req, res, next) => {
  logger.info("Change Password request received", { route: "/change-password", userId: req.user?._id });
  const { _id } = req.user;
  if (!req.user) {
    logger.warn("Unauthorized access attempt - No user found", { route: "/change-password" });
    return next(
      new ErrorClass("User is not authenticated", StatusCodes.UNAUTHORIZED)
    );
  }
  const { oldpass, newpass } = req.body;
  logger.info(`User ID: ${_id} - Initiating password change`, { userId: _id });
  
  // Find the user by ID
  const userExist = await userModel.findById(_id);
  if (!userExist) {
    logger.error(`User ID: ${_id} not found`, { userId: _id });
    return next(new ErrorClass(`User not found`, StatusCodes.NOT_FOUND));
  }
  logger.info(`User ID: ${_id} - Checking old password`, { userId: _id });
  const passcheck = await userExist.comparePassword(oldpass);
  if (!passcheck) {
    logger.warn(`User ID: ${_id} - Invalid old password`, { userId: _id });
    return next(new ErrorClass(`Invalid Old Password`, StatusCodes.NOT_FOUND));
  }
  logger.info(`User ID: ${_id} - Old password verified, checking new password`, { userId: _id });
  // Check if new password is the same as the old password
  const isSamePassword = await bcrypt.compare(newpass, userExist.password);
  if (isSamePassword) {
    logger.warn(`User ID: ${_id} - New password cannot be the same as old password`, { userId: _id });
    return next(
      new ErrorClass(
        "New password cannot be the same as the old password",
        StatusCodes.CONFLICT
      )
    );
  }

  logger.info(`User ID: ${_id} - Updating password`, { userId: _id });

  // Update password and save (Mongoose will hash it automatically)
  userExist.password = newpass;
  await userExist.save(); // This will trigger the password hashing middleware
  logger.info(`User ID: ${_id} - Password updated successfully`, { userId: _id });
  res.status(200).json({ message: "Password updated successfully" });
};
//7]==================== Delete User ===================
export const softDelete = async (req, res, next) => {
  //console.log(req.user)
  const { _id } = req.user;
  if (!req.user) {
    return next(
      new ErrorClass("User is not Authenticated", StatusCodes.UNAUTHORIZED)
    );
  }
// Blacklist the token
await addToBlackList(req.headers.authorization);
  const user = await userModel.findByIdAndUpdate(
    { _id },
    { isDeleted: true },
    { new: true }
  );
  logger.info(`User soft-deleted: ${_id}`);
  return res.status(StatusCodes.OK).json({ message: "Done", user });
};
//8]==================== Update User ===================
export const UpdateUser = async (req, res, next) => {
  const { _id } = req.user;
  if (!req.user) {
    return next(
      new ErrorClass("User is not authenticated", StatusCodes.UNAUTHORIZED)
    );
  }
  const userExist = await userModel.findById(_id);
  //Prevent password update
  if ("password" in req.body) {
    return next(
      new ErrorClass("Password update is not allowed", StatusCodes.BAD_REQUEST)
    );
  }
  
  if (req.body.email && req.body.email !== userExist.email) {
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
  logger.info(`User updated successfully: ${_id}`);
  res.status(200).json({ message: "Done", user });
};
//9]==================== Log out ========================
export const logout = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authorization header missing" });
  }
  // Check if token is already blacklisted
  const blacklisted = await isTokenBlackListed(authorization);
  if (blacklisted) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Token is already blacklisted" });
  }

  // Add token to blacklist
  await addToBlackList(authorization);
  logger.info("User logged out successfully");
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
        const newAdmin = new userModel({email:admin.email,password:admin.password,username: admin.email.split("@")[0],role:admin.role});
        await newAdmin.save();
        console.log(`Admin ${admin.email} created successfully`);
      } else {
        console.log(admin);
        console.log(`Admin ${admin.email} already exists`);
      }
    }
  } catch (error) {
    console.error("Error creating default admins:", error);
  }
};