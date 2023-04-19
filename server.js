import connectDB from "./../Back/config/db.js";
import path from "path";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import colors from "colors";
import passport from "passport";
import cookieSession from "cookie-session";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cors from "cors";
//2FA libraries
import { notFound, errorHandler } from "./middleware/errorMiddlware.js";
dotenv.config("./../.env");
connectDB();
const app = express();
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use("/api", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/supplier", supplierRoutes);
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/front/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "front", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running");
  });
}
app.use(notFound);
app.use(errorHandler);
app.use(
  cookieSession({
    name: "tuto-session",
    keys: ["key1", "key2"],
  })
);
app.get("/", (req, res) => {
  res.render("pages/index");
});


const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
  )
);
