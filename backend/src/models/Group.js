import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
    {
        groupName: {
            type: String,
            required: true,
        },
        groupPic: {
        type: String,
        default: ""
        },
        groupOwnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;