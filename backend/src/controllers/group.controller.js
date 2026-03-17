import Group from '../models/Group.js';
import User from '../models/User.js';

export const createGroup = async (req, res) => {
    try {
        const ownerId = req.user._id;
        let { groupName, members = [], groupPic } = req.body;

        if (!groupName || typeof groupName !== "string") {
            return res.status(400).json({ message: "Group name is required" });
        }

        if (members !== undefined && !Array.isArray(members)) {
            return res.status(400).json({ message: "members must be an array" });
        }

        groupName = groupName.trim().replace(/\s+/g, " ");
        if (groupName.length < 3 || groupName.length > 50) {
            return res.status(400).json({ message: "Group name must be 3-50 chars" });
        }

        // Build member set (owner always included)
        const uniqueMemberIds = [...new Set([ownerId.toString(), ...members.map(String)])];

        // Verify users exist
        const foundUsers = await User.countDocuments({ _id: { $in: uniqueMemberIds } });
        if (foundUsers !== uniqueMemberIds.length) {
            return res.status(400).json({ message: "One or more members are invalid" });
        }

        // Create group
        const newGroup = await Group.create({
            groupName,
            groupPic: groupPic || "",
            groupOwnerId: ownerId,
            admins: [ownerId],
            members: uniqueMemberIds,
        });

        return res.status(201).json({
            message: "Group created successfully",
            data: newGroup,
        });
    } catch (error) {
        console.error("Error creating group:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllMyGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find groups where user is a member
        const groups = await Group.find({ members: userId });
        const isAdminByGroupId = groups.reduce((acc, group) => {
            acc[group._id.toString()] = group.admins.some(
                (adminId) => adminId.toString() === userId.toString()
            );
            return acc;
        }, {});

        return res.status(200).json({
            message: "Groups fetched successfully",
            isAdminByGroupId,
            data: groups,
        });



    } catch (error) {
        console.error("Error fetching my groups:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getGroupById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId } = req.params;

        const group = await Group.findOne({
            _id: groupId,
            members: userId,
        });

        if (!group) {
            return res.status(403).json({
                message: "You are not a member of this group or the group does not exist",
            });
        }

        return res.status(200).json({
            message: "Group fetched successfully",
            data: group,
        });

    } catch (error) {
        console.error("Error fetching group by ID:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}