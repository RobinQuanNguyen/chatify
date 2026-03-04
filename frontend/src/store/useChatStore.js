import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import { toast } from 'react-hot-toast';
import { useAuthStore } from './useAuthStore.js';

const notificationSound = new Audio("/sounds/notification.mp3");

export const useChatStore = create((set, get) => ({
    allContact: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUserLoading: false,
    isMessageLoading:false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true" || false,
    highlightChatId: null,

    highlightChat: (userId) => {
        set({highlightChatId: userId})
        setTimeout(() => {
            set({highlightChatId: null})
        }, 2000) // Highlight for 2 seconds
    },

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
            receiverId: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true, // Flag to identify optimistic messages
        }

        // Immidiately add the optimistic message to the UI even before the API call completes
        set((state) => ({messages: [...state.messages, optimisticMessage]}))

        // Move the receiver (selectedUser) to top of chat list immediately
        set((state) => {
            const partnerId = selectedUser?._id;
            if (!partnerId) return {};

            const idx = state.chats.findIndex((u) => u._id === partnerId);

            // If partner is not in chats yet, add from contacts (optional)
            const partnerUser =
                idx !== -1
                ? state.chats[idx]
                : state.allContact.find((u) => u._id === partnerId);

            if (!partnerUser) return {};

            const nextChats = [...state.chats];
            if (idx !== -1) nextChats.splice(idx, 1);
            nextChats.unshift(partnerUser);

            return { chats: nextChats };
        });

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

    subscribeToMessages: async () => {
        const { selectedUser, isSoundEnabled, allContact, getAllContacts } = get();
        
        if (!selectedUser) return;

        // Load contacts if not already loaded
        if (!allContact || allContact.length === 0) {
            await getAllContacts();
        }

        const socket = useAuthStore.getState().socket;

        // Unsubscribe from previous listeners to prevent duplicates
        socket.off("newMessage");

        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;

            if (!isMessageSentFromSelectedUser) {
                // 1) Move sender to top of ChatList (chats array)
                set((state) => {
                    const senderId = newMessage.senderId;

                    const idx = state.chats.findIndex((u) => u._id === senderId);

                    // Use existing chat item if present, otherwise try contacts
                    const senderUser =
                        idx !== -1
                            ? state.chats[idx]
                            : state.allContact.find((u) => u._id === senderId);

                    // In a rare case (most likely an error or never happened scenario) where the sender is not found in both chats and contacts, we can simply ignore the update since we don't have any user info to show. This can happen if a message is received from a user that the current user has never interacted with and is not in their contacts for some reason.
                    if (!senderUser) return {};

                    const nextChats = [...state.chats];
                    if (idx !== -1) nextChats.splice(idx, 1);
                    nextChats.unshift(senderUser);

                    return { chats: nextChats };
                });

                // Highlight the chat with the sender for a short moment to draw attention
                get().highlightChat(newMessage.senderId);

                // 2) Toast
                const sender = (get().allContact || []).find((u) => u._id === newMessage.senderId);

                const senderName = sender?.fullName || "Someone";
                toast(`📩 New message from ${senderName}`);

                // 3) Optional: play sound for off-chat notifications too
                if (get().isSoundEnabled) {
                    notificationSound.currentTime = 0;
                    notificationSound.play().catch(() => {});
                }

                return;
            }

            const currentMessages = get().messages;

            set({ messages: [...currentMessages, newMessage]}) // keep all the old messages and add the new one at the end

            // Play sound notification for new incoming messages
            if (isSoundEnabled) {
                notificationSound.currentTime = 0; // reset to start
                notificationSound.play().catch((err) => {
                    console.log("Error playing notification sound:", err);
                });
            }
        })
    },

    // subscribeToMessages: async () => {
    //     const { selectedUser, isSoundEnabled, allContact, getAllContacts } = get();
        
    //     if (!selectedUser) return;

    //     // Load contacts if not already loaded
    //     if (!allContact || allContact.length === 0) {
    //         await getAllContacts();
    //     }

    //     const socket = useAuthStore.getState().socket;

    //     // Unsubscribe from previous listeners to prevent duplicates
    //     socket.off("newMessage");

    //     socket.on("newMessage", (newMessage) => {
    //         const contacts = get().allContact || [];

    //         const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;

    //         if (!isMessageSentFromSelectedUser) {
    //             // find sender in contact list
    //             const sender = contacts.find((u) => u._id === newMessage.senderId);
            
    //             const senderName = sender?.fullName || "Someone";

    //             toast(`📩 New message from ${senderName}`);
    //             return; // Don't add the message to the current chat if it's not from the selected user
    //         }

    //         const currentMessages = get().messages;

    //         set({ messages: [...currentMessages, newMessage]}) // keep all the old messages and add the new one at the end

    //         // Play sound notification for new incoming messages
    //         if (isSoundEnabled) {
    //             notificationSound.currentTime = 0; // reset to start
    //             notificationSound.play().catch((err) => {
    //                 console.log("Error playing notification sound:", err);
    //             });
    //         }
    //     })
    // },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    }

}))