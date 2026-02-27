import {create} from 'zustand'
import { axiosInstance } from '../lib/axios.js';
import { toast } from 'react-hot-toast';

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data.user})
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
            set({authUser: res.data.user})

            // use react-hot-toast to show success message
            toast.success("Account created successfully!")
        } catch (error) {
            toast.error(error.response?.data?.message || "Error signing up")
        } finally {
            set({isSigningUp: false})
        }
    },

    logIn: async (data) => {
        set({isLoggingIn: true});

        try {
            const res = await axiosInstance.post("/auth/login", data);
            
            //set({authUser: res.data.user})
            const user = res.data?.user ?? res.data;   // Handle cases where backend might return user object directly or wrapped in a "user" field
            set({ authUser: user });

            
            // use react-hot-toast to show success message
            toast.success("Logged in successfully!")
        } catch (error) {
            toast.error(error.response?.data?.message || "Error logging in")
        } finally {
            set({isLoggingIn: false})
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({authUser: null})
            toast.success("Logged out successfully!")
        } catch (error) {
            toast.error(error.response?.data?.message || "Error logging out")
        }
    },

    updateProfile: async (data) => {
        set({isUpdatingProfile: true});
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({authUser: res.data})
            toast.success("Profile updated successfully!")
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating profile")
        } finally {
            set({isUpdatingProfile: false})
        }
    },

}))