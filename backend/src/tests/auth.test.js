import { axiosInstance } from "../lib/axios.js";

describe("Auth API (integration via Axios)", () => {
  test("GET /auth/check returns 401 when not authenticated", async () => {
    const res = await axiosInstance.get("/auth/check");
    
    expect(res.status).toBe(401);
    expect(res.data).toHaveProperty("message");
    expect(res.data.message).toBe("Unauthorized. No token provided");

  });

//   test("POST /auth/login returns 400/401 for wrong credentials", async () => {
//     const res = await http.post("/auth/login", {
//       email: "wrong@example.com",
//       password: "wrongpassword",
//     });

//     expect([400, 401]).toContain(res.status);
//     expect(res.data).toHaveProperty("message");
//   });
});