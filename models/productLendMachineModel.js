import mongoose from 'mongoose'

const machineReviewSchema = mongoose.Schema({
    name: {
        type: String,
        requried: true,
    },
    rating: {
        type: Number,
        requried: true,
    },
    comment: {
        type: String,
        requried: true,
    }
}, {
    timestamps: true
})

const productLendMachineSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    }, 
    targetPlant: {
        type: String,
        required: true
    },
    reviews: [machineReviewSchema],
    rating: {
        type: Number,
        required: true,
        default: 0
    },
    machinepower: {
        type: String,
        required: true,
        default: 0
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
})

const farmer_lend_machines = mongoose.model('farmer_lend_machines', productLendMachineSchema);

export default farmer_lend_machines;