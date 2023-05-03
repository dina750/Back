import mongoose from "mongoose";
import Bid from './bid.js'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startingPrice: {
    type: Number,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  bids: [Bid.schema],
  biddingEndTime: {
    type: Date,
    required: true,
  },
});

const Product = mongoose.model('Products', productSchema);

export default Product;