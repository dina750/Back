import express from "express";
import connectDB from "./../Back/config/db.js";
import dotenv from "dotenv";
import morgan from "morgan";
import userRoutes from "./routes/userRoute.js";
import cors from "cors";
import errorMiddleware from "./middleware/error.js";
import cookieParser from "cookie-parser";
import bodyparse from "body-parser";
import fileUpload from 'express-fileupload';
import cloudinary from 'cloudinary'
import items from "./routes/product.js";
import Product from "./models/product.js";
import Bid from "./models/bid.js";
import { Server } from "socket.io";
import http from 'http';
import user from './routes/userRoute.js';
import product from './routes/productMarketRoutes.js'
import order from './routes/orderRoute.js';
import payment from './routes/paymentRoute.js';
import bodyParser from "body-parser";
import visitRoutes from './routes/visitRoutes.js'
import projectIdeaRoutes from './routes/projectIdeaRoutes.js'

cloudinary.config({ 
  cloud_name: 'store', 
  api_key: '7467848571151', 
  api_secret: '',
  secure: true
});

dotenv.config("./../.env");

connectDB();
const app = express();
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(bodyParser.json())
app.use(
  cors({
    origin: "*",
  })
);
app.use(cookieParser());
app.use(fileUpload());
app.get("/", (req, res) => {
  res.send("API is running");
});
app.use(errorMiddleware);
app.get("/", (req, res) => {
  res.render("pages/index");
});
app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', order);
app.use('/api/v1', payment);
app.use('/api/products', items);
app.use('/api/visits',visitRoutes)
app.use('/api/fundMe', projectIdeaRoutes);

const PORT = process.env.PORT || 5000;


const httpServer = http.createServer(app);

const io = new Server(httpServer, { cors: { origin: "*" } });

const port = process.env.PORT;
const startTime = process.hrtime();
httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
// Listen for Socket.IO connections
io.on("connection", (socket) => {
  console.log(`Socket ${socket.id} connected`);

  // Listen for when a user places a bid
  socket.on("bid", async ({ productId, userId, amount }) => {
    const product = await Product.findById(productId);
    const user = await User.findById(userId);
    // // Check if the bid amount is higher than the current price
    if (amount > product.currentPrice) {
    //   // Update the current price of the product and add the bid to the list of bids
    //   product.currentPrice = amount;
      product.bids.push(new Bid({ user: user._id, amount }));
      await product.save();
    //   // Notify all clients of the new bid
      io.emit("newBid", { productId, user: user.firstname, amount });
    }
  });

  // Listen for when the bidding time is up
  socket.on("endBidding", async (productId) => {
    const product = await Product.findById(productId);
    const winningBid = product.bids.sort((a, b) => b.amount - a.amount)[0];
    console.log(winningBid);
    // Add the product to the winner's cart and notify the winner
   
    const winner = await User.findById(winningBid.user);
    console.log(winner,"winner");
    if (winner !== null) {

      winner.cart.push(productId);
    
      await winner.save();
    
    
  
     io.to(`${winner.socketId}`).emit("bidWinner", { productId, amount: winningBid.amount });
  }
    
  });

  // Disconnect Socket.IO connection
  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});
