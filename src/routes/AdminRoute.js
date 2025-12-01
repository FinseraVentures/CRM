import express from "express";
import { UserModel } from "../models/UserModel.js";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

const AdminRoutes = express.Router();

//login
AdminRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).send({
        message: "Please provide both email and password.",
      });
    }

    // Find the user by email
    const user = await UserModel.findOneAndUpdate({ email },{isActive:true});
    

    if (!user) {
      return res.status(404).send({
        message: "User not found.",
      });
    }

    // Compare the provided password with the stored hashed password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send({
        message: "Invalid email or password.",
      });
    }
    const token = generateToken(user); // Generate JWT token

    // If credentials are valid, send a success response
    res.status(200).send({
     token,user
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

//logout
AdminRoutes.patch('/logout/:id',async(req,res)=>{
  const {id}= req.params
  try {
    const user = await UserModel.findByIdAndUpdate(id,{isActive:false})
    
    if (!user) {
      return res.status(404).send({
        message: "User not found.",
      });
    }
    res.send(user)
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});
// Assuming you already have the user object after login
export const generateToken = (user) => {
  return jwt.sign({ userId: user._id, user_role: user.user_role }, process.env.JWT_SECRET, {
    expiresIn: '24h', // Set token expiration time
  });
};

export default AdminRoutes;