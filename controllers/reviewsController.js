import Visit from "../models/visitModel.js"
import Review from "../models/ReviewModel.js"



export const createReview=async(req,res)=>{
    const visitId=req.params.visitId
    const newReview = new Review({...req.body})
    try{
        const savedReview=await newReview.save()
        await Visit.findByIdAndUpdate(visitId,
            {$push: {reviews:savedReview._id}
        })
        res.status(200).json({
            success:true,
            message:'Review submitted',
            data: savedReview
        }
        )

    }catch(err){
        res.status(500).json({
            success:false,
            message:'Failed to submit',
          
        }
        )

    }
}

export const deleteReview = async(req, res) => {
    try{
        await Review.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Review Removed' });
    } catch(err) {
        res.status(404).json(err)
 
    }
}

export const editReview = async (req, res) => {
    const review = await Review.findById(req.params.id);
   
    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    const { reviewText, rating} = req.body;
   
    if (reviewText) {
        review.reviewText = reviewText;
    }
    
    if (rating) {
        review.rating = rating;
    }

    const updatedReview = await review.save();
   
    res.json({
      _id: updatedReview._id,
      reviewText: updatedReview.reviewText,
      rating: updatedReview.rating,
      message: "Review updated successfully!"
    });
  };