import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import { toast } from 'react-hot-toast';
import { useAuthStore } from './useAuthStore.js';

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
            console.log("Contacts response:", res.data);
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
    },

    getMessagesByUserId: async (userId) => {
        set({isMessageLoading: true})
        try {
            const res = await axiosInstance.get("/message/" + userId);
            set({messages: res.data})

        } catch (error) {
            toast.error(error.response?.data?.message || "Error fetching messages")
        } finally {
            set({isMessageLoading: false})
        }
    },

    sendMessage: async (messageData) => {
        const {selectedUser, messages} = get()
        const {authUser} = useAuthStore.getState()
        const tempId = `temp-${Date.now()}`

        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiver: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true, // Flag to identify optimistic messages
        }

        // Immidiately add the optimistic message to the UI even before the API call completes
        set((state) => ({messages: [...state.messages, optimisticMessage]}))

        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData)

            // This was used to handle the mismatch between 2 types of response from the server, one with data property and one without. This was due to the inconsistency in the backend response which was later fixed. Keeping this code here for future reference in case of similar issues.
            const savedMsg = res.data.data ?? res.data; // handle both shapes

            // replace optimistic with saved message (keeps createdAt valid, avoids duplicates)
            set((state) => ({
                messages: state.messages.map((m) => (m._id === tempId ? savedMsg : m)),
            }));

        } catch (error) {
            // remove optimistic message on failure
            set((state) => ({
                messages: state.messages.filter((m) => m._id !== tempId),
            }));
            
            toast.error(error.response?.data?.message || "Error sending message")
        }
    },

}))