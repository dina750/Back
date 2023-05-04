import mongoose from 'mongoose'
 
/*const visitReviewSchema = mongoose.Schema({
    name: {
        type: String,
        requried: true,
    },
    rating: {
        type: Number,
        requried: true,
    }
 
}, {
    timestamps: true
})*/
 
const visitSchema = mongoose.Schema({
    /*user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },*/  
   /* id: {
        type: String,
        required: true
    },*/
    title: {
        type: String,
        required: true,
        unique: true,
      },
      city: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      distance: {
        type: Number,
        required: true,
      },
      photo: {
        type: String,
        // required: true,
      },
      desc: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      maxGroupSize: {
        type: Number,
        required: true,
      },
  
      reviews: [
        {
          type: mongoose.Types.ObjectId,
          ref: "Review",
          default:true,
        },
      ],
  
      featured: {
        type: Boolean,
        default: true,
      },
      state:{
        type: String,
        enum:["En Cours","Confirmed","Rejected"],
        default :"En Cours"
    },
    },
    { timestamps: true }
);
 
const Visit = mongoose.model('Visit', visitSchema);
 
export default Visit;