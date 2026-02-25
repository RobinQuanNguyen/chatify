import e from 'express';
import cloudinary from '../lib/cloudinary.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password"); // Get all users except the logged-in user, and exclude the password field

        res.status(200).json(filteredUsers);

    } catch (error) {
        console.log("Error in getAllContacts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const getMessagesByUserId = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id:userToChatId } = req.params;

        const message = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId},
                { senderId: userToChatId, receiverId: myId}
            ]
        })

        res.status(200).json(message);


    } catch (error) {
        console.log("Error in getMessagesByUserId:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;

        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            // If an image is included, upload it to Cloudinary and get the URL
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        res.status(201).json({ message: "Message sent successfully", data: newMessage });
    } catch (error) {
        console.log("Error in sendMessage:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getChatPartners = async (req, res) => {
    try {
        const myId = req.user._id;

        // Find all messages where the logged-in user is either the sender or receiver
        const messages = await Message.find({
            $or: [
                { senderId: myId },
                { receiverId: myId },
            ]
        })

        console.log("all message related to me", messages);
        

        //Extract unique user IDs of chat partners
        const chatPartnerIds = new Set();
        messages.forEach(msg => {
            if (msg.senderId.toString() === myId.toString()) {
                chatPartnerIds.add(msg.receiverId.toString());
            } else {
                chatPartnerIds.add(msg.senderId.toString());
            }
        });
        
        // Fetch user details of chat partners
        const chatPartners = await User.find({ _id: { $in: Array.from(chatPartnerIds) } }).select("-password");
        res.status(200).json(chatPartners);
    } catch (error) {
        
    }
}