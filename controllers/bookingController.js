import Booking from "../models/BookingModel.js"



export const createBooking=async(req,res)=>{
    const newBooking = new Booking(req.body)
    try{
        const savedBooking =await newBooking.save()
        res.status(200).json({
            success:true,
            message:'Your visit is booked',
            data:savedBooking
        })

    }catch(err){
        res.status(500).json({
            success:false,
            message:'Internal server'
        

    })
    }
};

export const getBooking=async(req,res)=>{
    const id=req.params.id
    try{
        const book = await Booking.findById(id)
        res.status(200).json({
            success:true,
            message:'successful',
            data:book
        })

    }catch(err){
        res.status(404).json({
            success:false,
            message:'Not found',
        });
    }
}

export const getAllBooking=async(req,res)=>{
    try{
        const books = await Booking.find()
        res.status(200).json({
            success:true,
            message:'successful',
            data:books
        })

    }catch(err){
        res.status(500).json({
            success:false,
            message:'Internal server error',
        });
    }
    /* const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL,
        to: Booking.userEmail,
        subject: "Confirmation de réservation",
        text: "Bonjour,\n\nVotre réservation a été confirmée avec succès.\n\nCordialement,\nL'équipe de réservation",
      };
      
transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email sent: " + info.response);
  }
}); */
}