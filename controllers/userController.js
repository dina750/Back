import asyncHandler from "express-async-handler";
import User from "./../models/userModel.js";
import generateToken from "./../utils/generateToken.js";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import Mailgen from "mailgen";
import speakeasy from "speakeasy";
import dotenv from "dotenv";


dotenv.config();
dotenv.config("./../.env");

// @desc    Auth user & token
// @rout    POST /api/users/login
// @access  public
// This function is used to authenticate user by handling requests made with email and password.
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    if (!user.state) {
      res.status(401);
      throw new Error("Your account is not activated");
    }
    res.json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      cropSelection: user.cropSelection,
      address: user.address,
      adressNumber: user.adressNumber,
      city: user.city,
      number: user.number,
      zip: user.zip,
      birthday: user.birthday,
      gender: user.gender,
      phone: user.phone,
      state: user.state,
      password: user.password,
      token: generateToken(user._id),
      isAdmin: user.isAdmin,
      secret: user.secret,
      twoFA: user.twoFA,
      
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
};

async function handleUser(req, res) {
  const { email, given_name, family_name } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      // User already exists, log them in
      // Return token or session to front-end to authenticate
      res.status(200).json({ message: "User logged in" });
    } else {
      // User does not exist, create new user
      const newUser = new User({
        email,
        firstname: given_name,
        lastname: family_name,
        password: "password", // You should generate a random password here
      });

      await newUser.save();

      // Return token or session to front-end to authenticate
      res.status(201).json({ message: "User created" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendConfirmationEmail = async (user, token) => {
  try {
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "My App",
        link: "http://myapp.com",
      },
    });

    const emailBody = mailGenerator.generate({
      body: {
        name: user.firstname,
        intro: "Welcome to Efarm! We are excited to have you on board.",
        action: {
          instructions:
            "To confirm your account, please click the button below:",
          button: {
            color: "#22BC66",
            text: "Confirm your account",
            link: `http://localhost:5000/api/users/confirm/${token}`,
          },
        },
        outro: "If you have any questions, just reply to this email.",
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Confirm your account on My App",
      html: emailBody,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending confirmation email: ${error}`);
  }
};

const confirmUserAccount = asyncHandler(async (req, res) => {
  // Get the token from the request parameters
  const { token } = req.params;

  if (!token) {
    // Return an error response if the token is missing
    res.status(401);
    throw new Error("Token is missing");
  }

  // Find the user with the given token
  const user = await User.findOne({ token });

  if (user) {
    // Activate the user's account
    user.state = true;
    await user.save();

    // Redirect the user to a login page after successful confirmation
    res.redirect("http://localhost:3000/login");
  } else {
    // Return an error response if the token is invalid
    res.status(401);
    throw new Error("Invalid token");
  }
});

// This function is responsible for sending a reset password email to a user.
// It takes an email and response object as its parameters.
const sendResetPasswordMail = async (email, res) => {
  // Find the user with the given email in the database.
  const userExists = await User.findOne({ email });

  try {
    // Define the contents of the email to be sent.
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "For reset Password",
      html:
        "<p> Hi " +
        userExists.firstname +
        ', Please copy the link and <a href="http://127.0.0.1:3000/UpdatePassword/' +
        userExists._id +
        '" > reset your password </a>',
    };

    // Send the email using the transporter object.
    await transporter.sendMail(mailOptions);

    console.log("Mail has been sent.");
  } catch (error) {
    // Return an error if sending the email was unsuccessful.
    res.status(400).send({ success: false, msg: error.message });
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password, isAdmin, twoFA } = req.body;

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
    twoFA,
  });
  const token = generateToken(user._id);
  user.token = token;
  await user.save();

  console.log(token);
  // send confirmation email
  await sendConfirmationEmail(user, token);
  if (user.twoFA) {
    await sendSecretByEmail(email, user.secret);
  }
  if (user) {
    res.status(201).json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      isAdmin: user.isAdmin,
      state: user.state,
      twoFA: user.twoFA,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Define an arrow function named 'getUserProfile' which takes two parameters: a request object 'req' and a response object 'res'
const getUserProfile = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id);
  if (!user) {
    res.status(401);
    throw new Error("User not found!!");
  }
  res.json(user);
});

// @desc    update user profile
// @rout    PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.body.id);

  if (user) {
    // Update user object with new values from request body
    user.firstname = req.body.firstname || user.firstname;
    user.lastname = req.body.lastname || user.lastname;
    user.email = req.body.email || user.email;
    user.gender = req.body.gender || user.gender;
    user.city = req.body.city || user.city;
    user.address = req.body.address || user.address;
    user.adressNumber = req.body.adressNumber || user.adressNumber;
    user.number = req.body.number || user.number;
    user.zip = req.body.zip || user.zip;
    user.birthday = req.body.birthday || user.birthday;

    // Save updated user object
    const updatedUser = await user.save();  

    // Return updated user object along with a token
    res.json({
      _id: updatedUser._id,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      email: updatedUser.email,
      gender: updatedUser.gender,
      city: updatedUser.city,
      address: updatedUser.address,
      adressNumber: updatedUser.adressNumber,
      number: updatedUser.number,
      zip: updatedUser.zip,
      birthday: updatedUser.birthday,
    });
  } else {
    // User not found, throw an error
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
const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id });
    if (user) {
      res.json({ message: "User removed" });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    GET user by id
// @rout    GET /api/users/:id
// @access  Private/ADMIN
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

// @desc    update user
// @rout    PUT /api/users/
// @access  Private/Admin
// This function updates a user document in the database
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  // Check if user exists, return 404 status code and "User not found" error if it does not exist.
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Extract new data from request body
  const { firstname, lastname, email, isAdmin, state } = req.body;

  // Update document fields with new data, or keep current values if new value is not provided
  user.firstname = firstname || user.firstname;
  user.lastname = lastname || user.lastname;
  user.email = email || user.email;
  user.isAdmin = isAdmin ?? user.isAdmin; // use current value of isAdmin if not provided
  user.state = state ?? user.state; // use current value of state if not provided

  // Save updated document to database and return it along with success message
  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    firstname: updatedUser.firstname,
    lastname: updatedUser.lastname,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    state: updatedUser.state,
  });
});

// POST http://127.0.0.1:5000/api/users/forget-password
// This function sends an email to reset a user's password.
const forgetPassword = async (req, res) => {
  const email = req.body.email; // get the email from the request body
  try {
    const user = await User.findOne({ email }); // find the user by the given email
    if (!user) {
      // if user does not exist with given email
      return res.status(404).json({
        success: false,
        message: "This email does not exist.",
      });
    }

    sendResetPasswordMail(user.email); // call an email service function to send email

    return res.status(200).json({
      success: true,
      message: "Please check your inbox to reset your password.",
    });
  } catch (error) {
    // catch any errors occurred while sending the email
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while sending the email.",
    });
  }
};

// This function hashes a user's password.
const securePassword = async (password) => {
  try {
    const passwordHash = await bcryptjs.hash(password, 10); // using the asynchronous `bcryptjs` library to hash the plaintext password
    return passwordHash; // returning the hashed password
  } catch (error) {
    console.error(error); // logging any errors to the console
    throw new Error("Error in hashing password!"); // throwing an error message if there are any issues with the hash operation
  }
};

//this is the reset password method
const resetPassword = asyncHandler(async (req, res) => {
  // Get userId from request params
  const { userId } = req.params;

  // Check whether userId exists or not
  if (!userId) {
    res.status(401);
    throw new Error("User ID is missing");
  }

  console.log("This is the user ID: ", userId);

  // Find user with given userId
  const user = await User.findById(userId);

  // If there is no such user, throw an error
  if (!user) {
    res.status(401);
    throw new Error("Invalid or expired token");
  }
});

//updating the password
const updatePassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const userId = req.params.userId;

  if (!password) {
    return res.status(400).json({ message: "Please provide a valid password" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }

  user.password = password;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password updated successfully",
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
    console.log(`Secret code sent to ${email}`);
  } catch (error) {
    console.error("Error occurred while sending the secret code", error);
    throw new Error("Something went wrong while sending the email.");
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
  forgetPassword,
  confirmUserAccount,
  resetPassword,
  updatePassword,
  handleUser,
};
