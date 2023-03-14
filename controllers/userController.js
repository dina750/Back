import { config } from "dotenv";
import express from "express";
import asyncHandler from "express-async-handler";
import User from "./../models/userModel.js";
import VerificationToken from "./../models/verificationToken.js";
import generateToken from "./../utils/generateToken.js";
import speakeasy from "speakeasy";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import configEmail from "../config/configEmail.js";
import jwt from "jsonwebtoken";
import Mailgen from "mailgen";

dotenv.config("./../.env");

// create nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  
  const sendConfirmationEmail = async (user) => {
    // create mail generator
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'My App',
        link: 'http://myapp.com',
      },
    });
  

    // create email template
const email = {
    body: {
      name: user.name,
      intro: 'Welcome to My App! We are excited to have you on board.',
      action: {
        instructions: 'To confirm your account, please click the button below:',
        button: {
          color: '#22BC66',
          text: 'Confirm your account',
          link: `http://myapp.com/api/users/confirm/${user.token}`,
        },
      },
      outro: 'If you have any questions, just reply to this email.',
    },
  };

// generate email content
const emailBody = mailGenerator.generate(email);

//options for the email such title and body
const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: 'Confirm your account on My App',
    html: emailBody,
  };

// sending the email
await transporter.sendMail(mailOptions);
  };

//this is a reset password Email format
const sendResetPasswordMail = async (name, email, token, res) => {
  try {
    const mailOptions = {
      from: configEmail.emailUser,
      to: email,
      subject: "For reset Password",
      html:
        "<p> Hi " +
        name +
        ', Please copy the link and <a href="http://127.0.0.1:5000/api/users/reset-password?token=' +
        token +
        '" > reset your password </a>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        if (res) {
          res.status(400).send({ success: false, msg: "Error sending email." });
        }
      } else {
        console.log("Mail has been sent: ", info.response);
      }
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};


// @desc    Auth user & token
// @rout    POST /api/users/login
// @access  public

const authUser = asyncHandler(async (req, res) => {
  const { email, password, secret } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.secret) {
      if (!secret) {
        await sendSecretByEmail(email, user.secret);
        return res.json({
          message:
            "a new 2FA secret code has been sent, please login again and insert the secret code sent.",
        });
      } else if (secret != user.secret) {
        return res.status(401).send({ message: "invalid secret 2FA code" });
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      secret: user.secret,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});


//this is sending the secret code by email
const sendSecretByEmail = async (email, secret) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "2 Factor Authentification code",
      text: `Your secret code is ${secret}`,
    });
    console.log(`secret code sent to ${email}`);
  } catch (error) {
    console.error("Secret not sent", error);
  }
};

// @desc    Register new user
// @rout    POST /api/users/
// @access  public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  let secret = "";
  secret = speakeasy.generateSecret({ length: 20 }).base32;
  const user = await User.create({
    name,
    email,
    password,
    secret,
  });

  // send confirmation email
  await sendConfirmationEmail(user);

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    GET user profile
// @rout    GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      cropSelection: user.cropSelection,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error("User not found!!");
  }
});

// @desc    update user profile
// @rout    PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.cropSelection = req.body.cropSelection || user.cropSelection;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      cropSelection: updatedUser.cropSelection,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(401);
    throw new Error("User not found!!");
  }
});

// @desc    GET all users
// @rout    GET /api/users/
// @access  Private/ADMIN
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    delete user profile
// @rout    DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOneAndDelete({ _id: req.params.id });
  if (user) {
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    GET user by id
// @rout    GET /api/users/:id
// @access  Private/ADMIN
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(401);
    throw new Error("User not found!!");
  }
});

// @desc    update user
// @rout    PUT /api/users/
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.cropSelection = req.body.cropSelection || user.cropSelection;
    user.isAdmin = req.body.isAdmin;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      cropSelection: updatedUser.cropSelection,
    });
  } else {
    res.status(401);
    throw new Error("User not found!!");
  }
});

// POST http://127.0.0.1:5000/api/users/forget-password
const forget_password = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (user) {
      const randomString = randomstring.generate();
      const data = await User.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetPasswordMail(user.name, user.email, randomString);
      res
        .status(200)
        .send({
          success: true,
          msg: "Please  check your inbox of mail and reset your password.",
        });
    } else {
      res
        .status(200)
        .send({ success: true, msg: "This email does not exists." });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcryptjs.hash(password, 10);
    return passwordHash;
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const create_token = async (id) => {
  try {
    const token = await jwt.sign({ _id: id }, config.secret_jwt);
    return token;
  } catch (error) {
    res.status(400).send(error.message);
  }
};


const reset_password = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      const password = req.body.password;
      const newPassword = await securePassword(password);
      const UserData = await User.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPassword, token: "" } },
        { new: true }
      );
      res
        .status(200)
        .send({
          success: true,
          msg: "User password has been reset.",
          data: UserData,
        });
    } else {
      res
        .status(200)
        .send({ success: false, msg: "This link has been expired." });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};


export {
  authUser,
  getUserProfile,
  registerUser,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  forget_password,
  reset_password,
};
