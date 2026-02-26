import {create} from 'zustand'
import { axiosInstance } from '../lib/axios.js';
import { toast } from 'react-hot-toast';

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data})
        } catch (error) {
            console.log("Error checking auth:", error);
            set({ authUser: null })
        } finally {
            set({isCheckingAuth: false})
        }
    },

    signUp: async (data) => {
        set({isSigningUp: true});

        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({authUser: res.data})

            // use react-hot-toast to show success message
            toast.success("Account created successfully!")
        } catch (error) {
            toast.error(error.response?.data?.message || "Error signing up")
        } finally {
            set({isSigningUp: false})
        }
    },
}))