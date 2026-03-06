import { axiosInstance } from "../lib/axios.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { ENV } from "../lib/env.js";

// Setup and teardown for tests
const test_user = {
  fullName: "Test User",
  email: "test@gmail.com",
  password: "Test@1234",
}

beforeAll(async () => {
  await mongoose.connect(ENV.MONGO_URI_FOR_TEST);
});

afterEach(async () => {
  await User.deleteMany({ email: test_user.email });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Check for wrong credentials ", () => {
  test("GET /auth/check returns 401 when not authenticated", async () => {
    const res = await axiosInstance.get("/auth/check");
    
    expect(res.status).toBe(401);
    expect(res.data).toHaveProperty("message");
    expect(res.data.message).toBe("Unauthorized. No token provided");
  });

  test("Wrong credentials returns 400", async () => {
    const res = await axiosInstance.post("/auth/login", {
      email: "wrong@example.com",
      password: "wrongpassword",
    });

    expect([400, 401]).toContain(res.status);
    expect(res.data).toHaveProperty("message");
    expect(res.data.message).toBe("Invalid credentials");
  });
});

describe("Check for POST /auth/signup function", () => {
  test("Successfully creates a new user", async () => {
    const res = await axiosInstance.post("/auth/signup", test_user);

    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty("_id");
    expect(res.data).toHaveProperty("fullName", "Test User");
    expect(res.data).toHaveProperty("email", "test@gmail.com");
    expect(res.data).toHaveProperty("profilePic", "");
  });

  test("Password is hashed in the database", async () => {
    await axiosInstance.post("/auth/signup", test_user);
    const userInDb = await User.findOne({ email: test_user.email });

    expect(userInDb).toBeDefined();
    expect(userInDb.password).not.toBe(test_user.password); // Password should be hashed
  });

  test("Token is generated and sent in cookie", async () => {
    const res = await axiosInstance.post("/auth/signup", test_user);

    expect(res.status).toBe(201);
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    const jwtCookie = cookies.find(cookie => cookie.startsWith("jwt="));
    expect(jwtCookie).toBeDefined();
  });

  test("Existing email returns 400", async () => {
    await axiosInstance.post("/auth/signup", test_user); // Create the user first

    const res = await axiosInstance.post("/auth/signup", test_user); // Try to create the same user again

    expect(res.status).toBe(400);
    expect(res.data).toHaveProperty("message");
    expect(res.data.message).toBe("Email already exists");
  });

  test("Missing fields returns 400", async () => {
    const res = await axiosInstance.post("/auth/signup", {
      email: "",
      password: "",
    });

    expect(res.status).toBe(400);
    expect(res.data).toHaveProperty("message");
    expect(res.data.message).toBe("Please provide all required fields");
  });

  test("Invalid email format returns 400", async () => {
    const res = await axiosInstance.post("/auth/signup", {
      fullName: "Test User",
      email: "invalid-email",
      password: "Test@1234",
    });

    expect(res.status).toBe(400);
    expect(res.data).toHaveProperty("message");
    expect(res.data.message).toBe("Please provide a valid email address");
  });

  test("Weak password (less than 6 characters) returns 400", async () => {
    const res = await axiosInstance.post("/auth/signup", {
      fullName: "Test User",
      email: "test@gmail.com",
      password: "weak",
    });

    expect(res.status).toBe(400);
    expect(res.data).toHaveProperty("message");
    expect(res.data.message).toBe("Password must be at least 6 characters long");
  });
});