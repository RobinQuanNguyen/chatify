import mongoose from "mongoose";
import User from "../models/User.js";
import Message from "../models/Message.js";

export const deleteUserAndData = async (req, res) => {
  try {
    const { id:userId } = req.params;

    console.log(`Received request to delete user with ID: ${userId}`);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // Prevent deleting yourself (optional but recommended)
    if (req.user._id.toString() === userId) {
      return res.status(403).json({ message: "You cannot delete your own account" });
    }

    // Ensure user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`User ${userId} exists and can be deleted`);

    //res.status(200).json({ message: "User exists and can be deleted" });

    // (Optional) prevent deleting an admin
    if (user.isAdmin) {
      return res.status(403).json({ message: "Cannot delete an admin user" });
    }

    // Final test
    // const message = await Message.find({
    //     $or: [
    //         { senderId: userId }, 
    //         { receiverId: userId }
    //     ]
    // })

    // res.status(200).json({ message: "User and related data can be deleted", messagesFound: message });

    // Test delete one message
    // const testDelete = await Message.deleteOne({
    //     _id: "69a6d26df93e11ef30d7aecb"
    // })

    //res.status(200).json({ message: "Test delete executed", testDeleteResult: testDelete });
    // Delete all messages where this user is sender or receiver
    const messageDeleteResult = await Message.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    // // Delete the user
    await User.deleteOne({ _id: userId });

    return res.status(200).json({
      message: "User and related data deleted successfully",
      deleted: {
        userId,
        messages: messageDeleteResult.deletedCount,
      },
    });
  } catch (error) {
    console.log("Error in deleteUserAndData:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};