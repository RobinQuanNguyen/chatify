import { useChatStore } from "../store/useChatStore.js"
import { useAuthStore } from "../store/useAuthStore.js";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader.jsx";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageLoadingSkeleton from "./MessageLoadingSkeleton.jsx";


function ChatContainer() {
  const { selectedUser, getMessagesByUserId, messages, isMessageLoading } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null)

  useEffect(() => {
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id);
    }
  }, [selectedUser, getMessagesByUserId]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages]) // Scroll to bottom whenever messages change

  return (
    <>
      <ChatHeader />

      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessageLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">

            {messages.map((msg, index) => {
              const prevMessage = messages[index - 1];

              const currentDate = new Date(msg.createdAt).toDateString();
              const prevDate = prevMessage
                ? new Date(prevMessage.createdAt).toDateString()
                : null;

              const showDateDivider = currentDate !== prevDate;

              return (
                <div key={msg._id}>
                  {/* DATE DIVIDER */}
                  {showDateDivider && (
                    <div className="flex justify-center my-4">
                      <div className="px-4 py-1 rounded-full text-xs bg-slate-700/50 text-slate-200">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* MESSAGE */}
                  <div
                    className={`chat ${
                      msg.senderId === authUser._id
                        ? "chat-end"
                        : "chat-start"
                    }`}
                  >
                    <div
                      className={`chat-bubble relative ${
                        msg.senderId === authUser._id
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-500 text-slate-200"
                      }`}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Shared"
                          className="rounded-lg h-48 object-cover"
                        />
                      )}

                      {msg.text && <p className="mt-2">{msg.text}</p>}

                      <p className="text-xs mt-1 opacity-75">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        ) : isMessageLoading ? (
          <MessageLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer