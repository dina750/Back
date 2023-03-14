import express from 'express'
import asyncHandler from 'express-async-handler'
import User from './../models/userModel.js';
import generateToken from './../utils/genarateToken.js'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

// @desc    Auth user & token
// @rout    POST /api/users/login
// @access  public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
  
    const user = await User.findOne({ email })
  
    if (user && (await user.matchPassword(password))) {
      // Generate a secret key for the user
      const secret = speakeasy.generateSecret({ length: 20 })
  
      // Save the secret key to the user's account
      user.twoFactorAuthSecret = secret.base32
      await user.save()
  
      // Generate a QR code URL for the user to scan with their authenticator app
      const qrCodeUrl = speakeasy.otpauthURL({
        secret: secret.ascii,
        label: `${user.name} (${user.email})`,
        issuer: 'My App',
        algorithm: 'SHA1'
      })
  
      // Generate the QR code image and send it to the client
      const qrCodeImage = await QRCode.toDataURL(qrCodeUrl)
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        cropSelection: user.cropSelection,
        twoFactorAuthSecret:user.twoFactorAuthSecret,
        qrCodeImage,
        token: generateToken(user._id)
      })
    } else {
      res.status(401)
      throw new Error('Invalid email or password')
    }
  })

// @desc    Register new user
// @rout    POST /api/users/
// @access  public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, cropSelection } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    const user = await User.create({
        name,
        email,
        password,
        cropSelection
    })

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            cropSelection: user.cropSelection,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
            .redirect('second')
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

//route POST /api/users/second
const twoFactorAuth = asyncHandler(async (req,res)=>{
    const user= await User.findById(req.user._id);
    const token = req.body.twoFactorAuthSecret; // 
    const verified = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token: token,
    })
    if (verified){
        res.json("2factor auth success!");
    }
    else{
        res.json("incorrect secret code!")
    }

})

// @desc    GET user profile
// @rout    GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            cropSelection: user.cropSelection,
            isAdmin: user.isAdmin,
        })
    } else {
        res.status(401)
        throw new Error('User not found!!')
    }
})

// @desc    update user profile
// @rout    PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    if (user) {
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.cropSelection = req.body.cropSelection || user.cropSelection
        if (req.body.password) {
            user.password = req.body.password
        }

        const updatedUser = await user.save()

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            cropSelection: updatedUser.cropSelection,
            token: generateToken(updatedUser._id)
        })
    } else {
        res.status(401)
        throw new Error('User not found!!')
    }
})

// @desc    GET all users
// @rout    GET /api/users/
// @access  Private/ADMIN
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({})
    res.json(users)
})

// @desc    delete user profile
// @rout    DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (user) {
        await user.remove()
        res.json({ message: 'User Removed' })
    } else {
        res.status(401)
        throw new Error('User not found!!')
    }
})

// @desc    GET user by id
// @rout    GET /api/users/:id
// @access  Private/ADMIN
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password')
    if (user) {
        res.json(user)
    } else {
        res.status(401)
        throw new Error('User not found!!')
    }
})

// @desc    update user
// @rout    PUT /api/users/
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (user) {
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.cropSelection = req.body.cropSelection || user.cropSelection
        user.isAdmin = req.body.isAdmin

        const updatedUser = await user.save()

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            cropSelection: updatedUser.cropSelection,
        })
    } else {
        res.status(401)
        throw new Error('User not found!!')
    }
})
// 
export {
    authUser,
    getUserProfile,
    registerUser,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
    twoFactorAuth
}