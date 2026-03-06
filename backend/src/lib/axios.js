import axios from "axios";
import { ENV } from "./env.js";

export const axiosInstance = axios.create({
  baseURL: ENV.NODE_ENV === "development" || ENV.NODE_ENV === "test" ? "http://localhost:3000/api" : "/api",
  withCredentials: true, // Include cookies in requests

  // Allow all status codes to be resolved (don't throw on non-2xx)
  validateStatus: () => true,
})

//console.log("Axios instance created with baseURL:", axiosInstance.defaults.baseURL);