import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
    {
        groupName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50,
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
        admins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

groupSchema.pre("validate", function ensureOwnerMembership(next) {
    const ownerId = this.groupOwnerId?.toString();

    if (!ownerId) {
        return next();
    }

    const memberIds = new Set((this.members || []).map((memberId) => memberId.toString()));
    memberIds.add(ownerId);
    this.members = Array.from(memberIds);

    const adminIds = new Set((this.admins || []).map((adminId) => adminId.toString()));
    adminIds.add(ownerId);
    this.admins = Array.from(adminIds);

    next();
});

const Group = mongoose.model("Group", groupSchema);

export default Group;