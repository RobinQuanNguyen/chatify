import { axiosInstance } from "../lib/axios.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ENV } from "../lib/env.js";
import User from "../models/User.js";


describe("Check for unauthenticated access", () => {
    test("Accessing protected route without token returns 401", async () => {
        const res = await axiosInstance.get("/message/12345");
        
        expect(res.status).toBe(401);
        expect(res.data).toHaveProperty("message");
        expect(res.data.message).toBe("Unauthorized. No token provided");
    });

    test("Accessing protected route with invalid token returns 401", async () => {
        const res = await axiosInstance.get("/message/12345", {
             headers: {
                Cookie: "jwt=eyJhbGcpOiJIUzI1NiIsInR8cCI6IkpXVCJ1.eyJ1c2VySWTiOiI2OTlkOTIxMTNjNGNkNjk3ODZhZWI1NzMoLCJpYXQiOjE3NzI6NzcxMTIsImV4cCI6MTc3MzQ4MTkxMn0.bGbtpvwQcz1Suo-8h4_Zk_O0NdVr_x4IS-4dzxglGg",
            },
        });

        expect(res.status).toBe(401);
        expect(res.data).toHaveProperty("message");
        expect(res.data.message).toBe("Unauthorized. Invalid token");
    });

    test("Accessing protected route with user that does not exist returns 401", async () => {
        const nonExistingUserId = new mongoose.Types.ObjectId().toString();
        const token = jwt.sign({ userId: nonExistingUserId }, ENV.JWT_SECRET, { expiresIn: "7d" });

        const res = await axiosInstance.get("/message/12345", {
            headers: {
                Cookie: `jwt=${token}`,
            },
        });

        expect(res.status).toBe(401);
        expect(res.data).toHaveProperty("message");
        expect(res.data.message).toBe("Unauthorized. User not found");
    });

    test("Accessing protected route with valid token returns 200", async () => {
        // First, create a test user and get a valid token for that user
        await mongoose.connect(ENV.MONGO_URI_FOR_TEST);
        const res = await axiosInstance.post("/auth/signup", {
            fullName: "Test User",
            email: "test@gmail.com",
            password: "Test@1234",
        })

        const cookies = res.headers["set-cookie"];
        const jwtCookie = cookies.find(cookie => cookie.startsWith("jwt="));
        expect(jwtCookie).toBeDefined();

        // Now use this token to access the protected route
        const res2 = await axiosInstance.get("/message/check", {
            headers: {
                Cookie: jwtCookie,
            },
        });
        expect(res2.status).toBe(200);
        expect(res2.data).toHaveProperty("message");
        expect(res2.data.message).toBe("Authenticated");

        // Clean up: delete the test user and close the database connection
        await mongoose.connection.db.collection("users").deleteOne({ email: "test@gmail.com"});
        await mongoose.connection.close();
    });
});

describe("Check for GET /message/contacts function", () => {
    //Setup and teardown for tests
    const test_user = {
        fullName: "Test User",
        email: "test@gmail.com",
        password: "Test@1234",
    }
    let jwtCookie;

    beforeAll(async () => {
        await mongoose.connect(ENV.MONGO_URI_FOR_TEST);
        const signupRes = await axiosInstance.post("/auth/signup", test_user);
        const cookies = signupRes.headers["set-cookie"];
        jwtCookie = cookies.find(cookie => cookie.startsWith("jwt="));
    });

    afterAll(async () => {
        await mongoose.connection.db.collection("users").deleteOne({ email: test_user.email});
        await mongoose.connection.close();
    });

    test("GET /message/contacts returns 200 and list of contacts when authenticated", async () => {
        const totalUsers = await User.countDocuments();

        const res = await axiosInstance.get("/message/contacts", {
            headers: {
                Cookie: jwtCookie,
            },
        });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data.length).toBe(totalUsers -1);
    });

    test("GET /message/contacts returns 401 when not authenticated", async () => {
        const res = await axiosInstance.get("/message/contacts");
        expect(res.status).toBe(401);
        expect(res.data).toHaveProperty("message");
        expect(res.data.message).toBe("Unauthorized. No token provided");
    });
});

describe("Check for message function", () => { 
    // Setup and teardown for tests. We will create 2 users, and send messages between them. Then we will check if the /message/chats route returns the correct chat partners in the correct order.
    const test_user1 = {
        fullName: "Test User 1",
        email: "test1@gmail.com",
        password: "Test@1234",
        jwtCookie: "",
        _id: "",
    }

    const test_user2 = {
        fullName: "Test User 2",
        email: "test2@gmail.com",
        password: "Test@1234",
        jwtCookie: "",
        _id: "",
    }

    const test_user3 = {
        _id: "69ac246d3e4dbe04d078ad70",
        fullName: "",
        email: "",
    }

    beforeAll(async () => {
        await mongoose.connect(ENV.MONGO_URI_FOR_TEST);
            
        // Clean up any existing test users from previous runs
        await mongoose.connection.db.collection("users").deleteMany({ 
            email: { $in: [test_user1.email, test_user2.email] }
        });

        // Create user 1
        const user1Res = await axiosInstance.post("/auth/signup", test_user1);
        const cookies1 = user1Res.headers["set-cookie"];
        test_user1.jwtCookie = cookies1.find(cookie => cookie.startsWith("jwt="));
        test_user1._id = user1Res.data._id;

        // Create user 2
        const user2Res = await axiosInstance.post("/auth/signup", test_user2);
        const cookies2 = user2Res.headers["set-cookie"];
        test_user2.jwtCookie = cookies2.find(cookie => cookie.startsWith("jwt="));
        test_user2._id = user2Res.data._id;

        // Fetch user 3 from database (already exists)
        const user3FromDb = await User.findById(test_user3._id);
        if (user3FromDb) {
            test_user3.fullName = user3FromDb.fullName;
            test_user3.email = user3FromDb.email;
        }
    });

    afterAll(async () => {
        // Clean up test users
        await mongoose.connection.db.collection("users").deleteMany({ 
            email: { $in: [test_user1.email, test_user2.email] }
        });
        
        // Clean up test messages
        await mongoose.connection.db.collection("messages").deleteMany({
            $or: [
                { senderId: new mongoose.Types.ObjectId(test_user1._id) },
                { receiverId: new mongoose.Types.ObjectId(test_user1._id) },
                { senderId: new mongoose.Types.ObjectId(test_user2._id) },
                { receiverId: new mongoose.Types.ObjectId(test_user2._id) }
            ]
        });
        await mongoose.connection.close();
    });

    test("POST /message/send/:id sends a message successfully", async () => {
        // Send a message from user 1 to user 2
        const res = await axiosInstance.post(`/message/send/${test_user2._id}`, {
                text: "Hello from user 1 to user 2. We will see again in the next test.",
        }, {
            headers: {
                Cookie: test_user1.jwtCookie,
            },
        });
        expect(res.status).toBe(201);
        expect(res.data).toHaveProperty("message");
        expect(res.data.message).toBe("Message sent successfully");
        expect(res.data).toHaveProperty("data");
        expect(res.data.data).toHaveProperty("senderId", test_user1._id);
        expect(res.data.data).toHaveProperty("receiverId", test_user2._id);
        expect(res.data.data).toHaveProperty("text", "Hello from user 1 to user 2. We will see again in the next test.");
        expect(res.data.data).toHaveProperty("_id");
        expect(res.data.data).toHaveProperty("createdAt");
    });

    test("GET /message/:id returns messages between the authenticated user and the specified user", async () => {
        // Get messages between user 1 and user 2 from user 1's perspective
        const res = await axiosInstance.get(`/message/${test_user2._id}`, {
            headers: {
                Cookie: test_user1.jwtCookie,
            },
        });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data.length).toBe(1);
        expect(res.data[0]).toHaveProperty("senderId", test_user1._id);
        expect(res.data[0]).toHaveProperty("receiverId", test_user2._id);
        expect(res.data[0]).toHaveProperty("text", "Hello from user 1 to user 2. We will see again in the next test.");
        expect(res.data[0]).toHaveProperty("_id");
        expect(res.data[0]).toHaveProperty("createdAt");
    });

    test("GET /message/chats returns the correct chat partners in the correct order", async () => {
        // Send another msg to user3 from user 1. This is to test that user 2 appears before user 3 in the chat partners list, since user 1 has a more recent chat with user 3 than with user 2.
        await axiosInstance.post(`/message/send/${test_user3._id}`, {
            text: "Hello from user 1 to user 3. This message should not appear in the chat between user 1 and user 2.",
        }, {
            headers: {
                Cookie: test_user1.jwtCookie,
            },
        });

        const res = await axiosInstance.get("/message/chats", {
            headers: {
                Cookie: test_user1.jwtCookie,
            },
        });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data.length).toBe(2);
        
        expect(res.data[0]).toHaveProperty("_id", test_user3._id);
        expect(res.data[1]).toHaveProperty("_id", test_user2._id);
    });
   
});