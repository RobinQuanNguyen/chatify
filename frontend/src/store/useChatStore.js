import { create } from 'zustand';
import axios from 'axios';
import { axiosInstance } from '../lib/axios.js';
import { toast } from 'react-hot-toast';

export const useChatStore = create((set, get) => ({
    allContact: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUserLoading: false,
    isMessageLoading:false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true" || false,

    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled)
        set({isSoundEnabled: !get().isSoundEnabled})
    },

    setActiveTab: (tab) => set({activeTab: tab}),
    setSelectedUser: (selectedUser) => set({selectedUser: selectedUser}),

    getAllContacts: async () => {
        set({isUserLoading: true})
        try {
            const res = await axiosInstance.get("/message/contacts");
            set({allContact: res.data})

        } catch (error) {
            toast.error(error.response?.data?.message || "Error fetching contacts")
        } finally {
            set({isUserLoading: false})
        }
    },

    getMyChatPartners: async() => {
        set({isUserLoading: true})
        try {
            const res = await axiosInstance.get("/message/chats");
            set({chats: res.data})

        } catch (error) {
            toast.error(error.response?.data?.message || "Error fetching chats")
        } finally {
            set({isUserLoading: false})
        }
    }
}))