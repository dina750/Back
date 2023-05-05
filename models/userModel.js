import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken';
import mongoose from 'mongoose'


const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
    },
    gender: {
        type: String,
        required: [true, "Please Enter Gender"]
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Password should have atleast 8 chars"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
        },
        url: {
            type: String,

        }

    },
    cart: [{
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false,
    }],
    role: {
        type: String,
        default: "user",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJWTToken = function () {
    return jsonwebtoken.sign({ id: this._id }, "abc123", {
        expiresIn: "7d"
    });
}

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.methods.getResetPasswordToken = async function () {

    // generate token
    const resetToken = randomBytes(20).toString("hex");

    // generate hash token and add to db
    this.resetPasswordToken = createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
}
const User = mongoose.model('User', userSchema);

export default model('User', userSchema);