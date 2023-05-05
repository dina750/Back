import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter product description"]
    },
    highlights: [
        {
            type: String,
            required: true
        }
    ],
    specifications: [
        {
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            }
        }
    ],
    price: {
        type: Number,
        required: [true, "Please enter product price"]
    },
    cuttedPrice: {
        type: Number,
        required: [true, "Please enter cutted price"]
    },
    images: [
        {
            public_id: {
                type: String,
                required: false
            },
            url: {
                type: String,
                required: false,
                default: "https://e7.pngegg.com/pngimages/725/912/png-clipart-sunflower-seeds-sunflower-seeds.png"
            }
        }
    ],
    brand: {
        name: {
            type: String,
            required: false,
            default: "Default Brand Name"
        },
        logo: {
            public_id: {
                type: String,
                required: false
            },
            url: {
                type: String,
                required: false,
                default: "https://img.lovepik.com/free-png/20211212/lovepik-whole-grains-png-image_401512728_wh1200.png"
            }
        }
    },
    category: {
        type: String,
        required: [true, "Please enter product category"]
    },
    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        maxlength: [4, "Stock cannot exceed limit"],
        default: 1
    },
    warranty: {
        type: Number,
        default: 1
    },
    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: Schema.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default model('Product', productSchema);
