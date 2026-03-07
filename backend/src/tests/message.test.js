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