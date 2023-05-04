import mongoose from 'mongoose'

const projectIdeaSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fundingGoal: {
      type: Number,
      required: true,
    },
    currentAmountRaised: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  
  });
  
  // Define the Donation schema
  const donationSchema = new mongoose.Schema({
    amount: {
      type: Number,
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectIdea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectIdea',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const ProjectIdea = mongoose.model('ProjectIdea', projectIdeaSchema);
const Donation = mongoose.model('Donation', donationSchema);


export  { ProjectIdea, Donation};