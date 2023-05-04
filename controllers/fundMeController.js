import { ProjectIdea, Donation } from './../models/projectModel.js';
import asyncHandler from 'express-async-handler'
import nodemailer from 'nodemailer';
import User  from '../models/userModel.js';

const sendThankYouEmail = async (userEmail) => {
  try {
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.log('User not found');
      return;
    }

    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'chedilandolsi@gmail.com',
      pass: 'chediGOOGLE'
      }
    });

    let info = await transporter.sendMail({
      from: '"Efarm" chedilandolsi@gmail.com',
      to: userEmail,
      subject: 'Thank you for your donation!',
      text: `Dear ${user.name},\n\nThank you for your generous donation to our project. Your support means a lot to us and will help us achieve our goals.\n\nBest regards,\nThe Project Team`,
      html: `<p>Dear ${user.name},</p><p>Thank you for your generous donation to our project. Your support means a lot to us and will help us achieve our goals.</p><p>Best regards,<br>The Project Team</p>`
    });

    console.log('Thank you email sent:', info.messageId);
  } catch (error) {
    console.log(error);
  }
};

async function sendGiftCardEmail(userEmail, donation, giftCardAmount) {
  // Get the donor's email address from the donation object
  const user = await User.findOne({ email: userEmail });

  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'chedilandolsi@gmail.com',
      pass: 'chediGOOGLE'
    }
  });

  // Simulate generating a gift card code
  const giftCardCode = Math.random().toString(36).substring(7);

  // Configure the email message
  const mailOptions = {
    from: 'chedilandolsi@gmail.com',
    to: userEmail,
    subject: 'Thank you for your donation!',
    text: `Dear ${user.firstname},\n\nThank you so much for your donation of $${donation.amount} to our project "${donation.projectIdea.title}". As a token of our appreciation, we would like to offer you a gift card worth $${giftCardAmount} from our partners at GiftCardCo. Your gift card code is: ${giftCardCode}.\n\nBest regards,\nThe Project Team`
  };

  // Send the email
  await transporter.sendMail(mailOptions);

  console.log(`Gift card email sent to ${donorEmail}`);
};



// Function to create a new project idea
// @rout    POST/createProject
const createProjectIdea = asyncHandler(async (req, res) => {
    const { title, description, fundingGoal, image } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const creator = req.user._id;
    console.log(creator);
  
    try {
      const projectIdea = await ProjectIdea.create({ title, description, creator, fundingGoal, image });
      res.status(201).json(projectIdea);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Function to get all project ideas
// @rout    GET /projects
const getAllProjectIdeas = asyncHandler(async (req, res) => {
  try {
    const projectIdeas = await ProjectIdea.find().populate('creator');
    res.status(200).json(projectIdeas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Function to get a project idea by id
// @rout    GET /projects/:id
const getProjectIdeaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const projectIdea = await ProjectIdea.findById(id).populate('creator');
    if (!projectIdea) {
      return res.status(404).json({ message: 'Project idea not found' });
    }
    res.status(200).json(projectIdea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Function to update a project idea by id
// @rout    PUT/updateProject/:id
const updateProjectIdeaById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, fundingGoal } = req.body;

  try {
    let projectIdea = await ProjectIdea.findById(id);
    if (!projectIdea) {
      return res.status(404).json({ message: 'Project idea not found' });
    }
 
    projectIdea.title = title || projectIdea.title;
    projectIdea.description = description || projectIdea.description;
    projectIdea.fundingGoal = fundingGoal || projectIdea.fundingGoal;

    projectIdea = await projectIdea.save();
    res.status(200).json(projectIdea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Function to delete a project idea by id
// @rout    DELETE/deleteProject/:id
const deleteProjectIdeaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const projectIdea = await ProjectIdea.findById(id);
    if (!projectIdea) {
      return res.status(404).json({ message: 'Project idea not found' });
    }
   
    await projectIdea.deleteOne();
    res.status(200).json({ message: 'Project idea deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new donation
const createDonation = asyncHandler(async (req, res) => {
  const { amount, donor } = req.body;
  
  const projectIdea = await ProjectIdea.findById(req.params.id);

  if (!projectIdea) {
    return res.status(404).json({ success: false, error: 'Project idea not found' });
  }

  if (projectIdea.currentAmountRaised + amount > projectIdea.fundingGoal) {
    return res.status(400).json({ success: false, error: 'Donation amount exceeds funding goal' });
  }
    
  try {
    const newDonation = await Donation.create({ amount, donor:donor._id, projectIdea: projectIdea._id });

    await ProjectIdea.findByIdAndUpdate(projectIdea._id, { $inc: { currentAmountRaised: amount } });
    res.status(201).json(Donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
  
  // Get all donations for a project idea
  const getDonationsForProjectIdea = asyncHandler(async (req, res) => {
    try {
      const projectIdeaId = req.params.projectIdeaId;
      const donations = await Donation.find({ projectIdea: projectIdeaId }).populate('donor');
      res.status(200).json({ success: true, data: donations });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  
  // Get a single donation by id
  const getDonationById = asyncHandler ( async (req, res) => {
    try {
      const donation = await Donation.findById(req.params.id).populate('donor projectIdea');
      if (!donation) {
        return res.status(404).json({ success: false, error: 'Donation not found' });
      }
      res.status(200).json({ success: true, data: donation });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // Function to get all project ideas created by the authenticated user
// @route   GET /myProjects
  const getMyProjectIdeas = asyncHandler(async (req, res) => {
    
    
    try {
      const {id}=req.params;
      console.log(req.params);
      const projectIdeas = await ProjectIdea.find({creator : id});

      res.status(200).json(projectIdeas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });




const getTopDonationsForProject = asyncHandler(async (req, res) => {
  const projectId = req.params.id;

  try {
    // Get the project idea
    const projectIdea = await ProjectIdea.findById(projectId);

    // Get the top 5 donations for the project idea
    const topDonations = await Donation.find({ projectIdea })
      .sort('-amount')
      .limit(5)
      .populate('donor');

    res.status(200).json(topDonations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const getTopTenDonationsForProjectIdea = asyncHandler(async (req, res) => {
  const projectIdeas = await ProjectIdea.find();

  const topTenDonations = [];

  for (let i = 0; i < projectIdeas.length; i++) {
    const projectIdea = projectIdeas[i];
    const topDonations = await Donation.find({ projectIdea })
      .sort('-amount')
      .limit(10)
      .populate('donor', 'firstName lastName');
    
    // Add the top donations to the result array
    topTenDonations.push(...topDonations);
  }

  // Sort the result array by donation amount in descending order
  topTenDonations.sort((a, b) => b.amount - a.amount);

  res.status(200).json(topTenDonations.slice(0, 10));
});

export { 
    deleteProjectIdeaById,
    updateProjectIdeaById,
    getAllProjectIdeas,
    getProjectIdeaById,
    createProjectIdea,
    createDonation,
    getDonationById,
    getDonationsForProjectIdea,
    getMyProjectIdeas,
    getTopDonationsForProject,
    getTopTenDonationsForProjectIdea
}