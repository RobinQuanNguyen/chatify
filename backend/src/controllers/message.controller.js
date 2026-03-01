import cloudinary from '../lib/cloudinary.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { getReceiverSocketId } from '../lib/socket.js';
import { io } from '../lib/socket.js';

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

        // Add some controllers to the img and message. We are allowed to send message to ourselves.
        if (!text && !image) {
            return res.status(400).json({ message: "Message text or image is required" });
        }
        
        const receiverCheck = await User.exists({ _id: receiverId });
        if (!receiverCheck) {
            return res.status(404).json({ message: "Receiver not found" });
        }


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

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

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
        });        

        //Extract unique user IDs of chat partners
        // const chatPartnerIds = new Set();
        // messages.forEach(msg => {
        //     if (msg.senderId.toString() === myId.toString()) {
        //         chatPartnerIds.add(msg.receiverId.toString());
        //     } else {
        //         chatPartnerIds.add(msg.senderId.toString());
        //     }
        // });

        // Extract partner ID (in a cleaner way using map and Set)
        const chatPartnersId = [...
            new Set(
                messages.map((msg) => 
                    msg.senderId.toString() === myId.toString() 
                    ? msg.receiverId.toString() 
                    : msg.senderId.toString()
                )
            )
        ];

        // Fetch user details of chat partners
        const chatPartners = await User.find({ _id: { $in: chatPartnersId } }).select("-password");

        res.status(200).json(chatPartners);
    } catch (error) {
        
    }
}