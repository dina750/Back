import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    cropSelection: {
        type: String,
        required: false
    },
    address:{
        type:String,
        required: false
    },
    adressNumber:{
        type:String,
        required: false
    },
    city:{
        type: String,
        required: false
    },
    number:{
        type: Number,
        required : false
    },
    zip:{
        type: String,
        required : false
    },
    birthday:{
        type: Date,
        required : false
    },
    gender:{
        type: String,
        required : false
    },
    phone:{
        type: Number,
        required : false
    },
    state:{
        type: Boolean,
        default :false
    },
    password: {
        type: String,
        required: true
    }, 
    token:{
        type:String
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    secret:{
        type: String,
        required: false,
        default: false
    },
    twoFA:{
        type: Boolean,
        default:false
    }
    
}, {
    timestamps: true
})

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema);

export default User;