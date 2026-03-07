import { axiosInstance } from "../lib/axios.js";


describe("Check for unauthenticated access", () => {
    test("Accessing protected route without token returns 401", async () => {
        const res = await axiosInstance.get("/message/12345").catch((err) => err.response);
        
        expect(res.status).toBe(401);
        expect(res.data).toHaveProperty("message");
        expect(res.data.message).toBe("Unauthorized. No token provided");
    });

    //test("Accessing protected route with invalid token returns 401", async () => {});
    //test("Accessing protected route with valid token returns 200", async () => {});
});