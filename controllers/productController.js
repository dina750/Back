import asyncHandler from 'express-async-handler';
import Product from '../models/product.js';
import User from '../models/userModel.js';
// Create a new product
const addProduct = asyncHandler(async (req, res) => {
  const { name, description, imageUrl, startingPrice, currentPrice, bids, biddingEndTime,id } = req.body;
 
  const creator = await User.findById(id);   
  try {
    const newProduct = await Product.create({ name, description, imageUrl, creator, startingPrice, currentPrice, bids, biddingEndTime ,});
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});


const updateProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

const deleteProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ message: 'Product deleted successfully' });
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.json(products);
});
const getTopBidderProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  try {
    // Get the project idea
    const product = await Product.findById(productId);

    // Get the top 5 donations for the project idea
    const topBids = await Donation.find({ product })
      .sort('-amount')
      .limit(5)
      .populate('bidder');

    res.status(200).json(topBids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const getMyProducts = asyncHandler(async (req, res) => {
    
    
  try {
    const {id}=req.params;
    console.log(req.params);
    const myProducts = await Product.find({creator : id});

    res.status(200).json(myProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const getOtherProducts = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const otherProducts = await Product.find({ creator: { $ne: id } });

    res.status(200).json(otherProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
export { addProduct, updateProductById, deleteProductById, getProductById, getProducts,getTopBidderProduct,getMyProducts,getOtherProducts };
