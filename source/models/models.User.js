import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: [6, "Username must be at least 6 characters long"],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Password must be at least 6 characters long"],
  },
});

const User = mongoose.model('User', UserSchema)
export default User
