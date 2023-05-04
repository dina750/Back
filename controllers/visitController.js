import express from 'express'
import asyncHandler from 'express-async-handler'
import visit from "./../models/visitModel.js";
// @desc    Fetch all lending Machines
// @rout    GET /visits
// @access  public
const getvisits = asyncHandler(async(req, res) => {
    const visite = await visit.find({})
    res.json(visite);
})
 
// @desc    Fetch machine by id
// @rout    GET /visits/:id
// @access  public
const getvisitById = asyncHandler(async(req, res) => {
    const Visite = await visit.findById(req.params.id).populate('reviews');
 
    if(Visite) {
        res.json(Visite);
    } else {
        res.status(404)
        throw new Error('visit not Found')
    }
})
 
// @desc    Fetch machine by id
// @rout    GET /visits/:id
// @access  private/admin
/*const deletevisit = asyncHandler(async(req, res) => {
    const Visite = await visit.findById(req.params.id);
 
    if(Visite) {
        Visite.remove()
        res.json({ message: 'visit Removed' });
    } else {
        res.status(404)
        throw new Error('visit not Found')
    }
})*/
const deletevisit = asyncHandler(async(req, res) => {
    try{
        await visit.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'visit Removed' });
    } catch(err) {
        res.status(404).json(err)
 
    }
})
 
// @desc    Create Lend Machine
// @rout    POST /visits/
// @access  private/ Admin
/*const createvisit = asyncHandler(async (req, res) => {
    const Visite = new visit({
       //user: req.user._id,
       title: "Swiss Farm Cottage",
       city: "Tanzanie",
       distance: 300,
       address:" Box 70,Lushoto, Lushoto, Tanzanie",
       price: 299,
       maxGroupSize: 10,
       desc: "this is the description",
       avgRating: 4.5,
       photo: tourImg01,
       featured: true,
    })
 
    const createdvisit = await visit.save()
    res.status(201).json(createdvisit)
})*/
 
const createvisit = asyncHandler(async (req, res) => {
    const { title, city, address, distance, photo, desc, price, maxGroupSize } = req.body;

    try {
      const newVisit = new visit({
        title,
        city,
        address,
        distance,
        photo,
        desc,
        price,
        maxGroupSize,
      });
  
      const savedVisit = await newVisit.save();
      res.json(savedVisit);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  });
// @desc    Update Lend Machine
// @rout    PUT /visits/:id
// @access  private/ Admin
const updatevisit = asyncHandler(async (req, res) => {
    const { title, city, distance, address, price, maxGroupSize, desc,avgRating,photo,featured } = req.body
 
    const updatevisit = await visit.findById(req.params.id)
 console.log(req.params.id);
    if (updatevisit) {
 
        updatevisit.title = title
        updatevisit.city = city
        updatevisit.distance = distance
        updatevisit.address = address
        updatevisit.price = price
        updatevisit.maxGroupSize = maxGroupSize
        updatevisit.desc = desc
        updatevisit.avgRating = avgRating
        updatevisit.photo = photo
        updatevisit.featured = featured
        const updatedVisit = await updatevisit.save()
        res.status(201).json(updatedVisit)
    } else {
        res.status(401)
        throw new Error('Visit not found')
    }
})

const getVisitBySearch=async(req,res)=>{
    const city = new RegExp(req.query.city,'i')
    const distance=parseInt(req.query.distance)
    const maxGroupSize=parseInt(req.query.maxGroupSize)
    try{
        const visits=await visit.find({
            city,
            distance:{$gte: distance},
            maxGroupSize:{$gte: maxGroupSize},

        }).populate("reviews");
        res.status(200).json({
            success:true,
            message:"Successful",
            data:visits,
        });

    }catch(err){
        res.status(404).json({
            success:false,
            message:"Not Found",
        });

    }
}

const getFeaturedVisits=async(req,res)=>{

    try{
        const visits=await visit.find({featured:true,
        state:"Confirmed"})
        res.status(200).json({
            success:true,
            message:"Successful",
            data:visits,
        })

    }catch(err){
        res.status(401).json({
            success:false,
            message:"Not Found",
        });

    }
}
 
const setVisitConfirmed = asyncHandler(async (req, res) => {
    const { state } = req.body
 
    const updatevisit = await visit.findById(req.params.id)
 console.log(req.params.id);
    if (updatevisit) {
 
      
        updatevisit.state = req.body.state
 
 
        const updatedVisit = await updatevisit.save()
        res.status(201).json(updatedVisit)
    } else {
        res.status(401)
        throw new Error('Visit not found')
    }
})
export { 
    getvisits, 
    getvisitById, 
    deletevisit,
    createvisit,
    updatevisit,
    getVisitBySearch,
    getFeaturedVisits,
    setVisitConfirmed
}
