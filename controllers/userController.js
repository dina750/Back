import asyncHandler from "express-async-handler";
import User from "./../models/userModel.js";
import generateToken from "./../utils/generateToken.js";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import configEmail from "../config/configEmail.js";
import jwt from "jsonwebtoken";
import Mailgen from "mailgen";
import speakeasy from "speakeasy"
import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'

dotenv.config('./../.env');
// @desc    Auth user & token
// @rout    POST /api/users/login
// @access  public
const authUser = asyncHandler(async (req, res) => {
    
    const { email, password} = req.body
    const user = await User.findOne({ email })
    
    if (user && (await user.matchPassword(password)) && user.state) {  
        
            res.json({
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                isAdmin: user.isAdmin,
                state:user.state,
                token: generateToken(user._id),
              });
            } else {
              res.status(401);
              throw new Error("Invalid email or password or your account is not activated");
            }
          });

// create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

//Send the confirmation email
const sendConfirmationEmail = async (user,token) => {
  // create mail generator
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "My App",
      link: "http://myapp.com",
    },
  });

  // create email template
  const email = {
    
    body: {
    
      name: user.firstname,
      intro: "Welcome to Efarm! We are excited to have you on board.",
      action: {
        instructions: "To confirm your account, please click the button below:",
        button: {
          color: "#22BC66",
          text: "Confirm your account",
          link: `http://localhost:5000/api/users/confirm/${token}`,
        },
      },
      outro: "If you have any questions, just reply to this email.",
    },
  };
  
  // generate email content
  const emailBody = mailGenerator.generate(email);

  //options for the email such title and body
  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Confirm your account on My App",
    html: emailBody,
  };

  // sending the email
  await transporter.sendMail(mailOptions);
};

//this is the confirmation to the account 
const confirmUserAccount = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
      res.status(401);
      throw new Error('Token is missing');
    }
    console.log("this is the url token ",token)
    const user = await User.findOne({ token});
        console.log("this is the user token",user.token)
    if (user) {
      user.state = true;
      await user.save();
  
      res.redirect('http://localhost:5000/api/users/login'); // or any other URL you want to redirect to after successful confirmation
    } else {
      res.status(401);
      throw new Error('Invalid token');
    }
  });

//this is a reset password Email format
const sendResetPasswordMail = async (firstname, userId, email, token, res) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "For reset Password",
     html: 
     "<p> Hi " + 
     firstname + 
     ', Please copy the link and <a href="http://127.0.0.1:5000/api/users/reset-password/' + userId + '/' + token + '" > reset your password </a>',

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

// const authUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });
  

//   if (user && (await user.matchPassword(password)) && user.state ) {
    
    




// @desc    Register new user
// @rout    POST /api/users/
// @access  public
const registerUser = asyncHandler(async (req, res) => {
  const { firstname,lastname, email, password,isAdmin } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  let secret = "";
  secret = speakeasy.generateSecret({ length: 20 }).base32;

  const user = await User.create({
    firstname,
    lastname,
    email,
    isAdmin,
    password,
    secret,
    twoFA
  });
  const token = generateToken(user._id);
  user.token = token;
  await user.save();
    
  console.log(token)
  // send confirmation email
  await sendConfirmationEmail(user,token);
  if(user.twoFA){
    await sendSecretByEmail(email, user.secret);
    };
  if (user) {
    res.status(201).json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      isAdmin: user.isAdmin,
      state:user.state,
      token,
      
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
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
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
    user.firstname = req.body.firstname || user.firstname;
    user.email = req.body.email || user.email;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstname: updateUser.firstname,
      lastname: updateUser.lastname,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
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
    user.firstname = req.body.firstname || user.firstname;
    user.lastname = req.body.lastname || user.lastname;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin;
    user.state = req.body.state;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      state:updateUser.state,
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
    const id =user.userId
    if (user) {
      
      sendResetPasswordMail(user.firstname, id, user.email, user.token);
      res.status(200).send({
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

const reset2 = asyncHandler(async (req, res) => {
  const { token } = req.params;

  log.console("this is a reset",token)


  
});

//this is the reset password method
const resetPassword = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    res.status(401);
    throw new Error('User ID is missing');
  }

  console.log("This is the user ID: ", userId);

  const user = await User.findById(userId);

  if (!user) {
    res.status(401);
    throw new Error('Invalid or expired token');
  }
});







//updating the password
const updatePassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const userId = req.params.userId;

  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.password = password;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
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
  confirmUserAccount,
  resetPassword,
  updatePassword,
  reset2,
};
