// Create a model for User
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        minLength: 6
    },
    profilePic: {
        type: String,
        default: ""
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
}, {timestamps: true}); // createAt and updateAt built-in fields

const User = mongoose.model("User", userSchema);

export default User;