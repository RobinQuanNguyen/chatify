import { useChatStore } from "../store/useChatStore.js"
import BorderAnimatedContainer from "../components/BorderAnimatedContainer.jsx"
import ProfileHeader from "../components/ProfileHeader.jsx"
import ActiveTabSwitch from "../components/ActiveTabSwitch.jsx"
import ChatList from "../components/ChatList.jsx"
import ContactList from "../components/ContactList.jsx"
import ChatContainer from "../components/ChatContainer.jsx"
import NoConversationPlaceHolder from "../components/NoConversationPlaceHolder.jsx"

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore()
  return (
      <div className="relative w-full max-w-6xl h-[800px]">
        <BorderAnimatedContainer>
          {/* LEFT SIDE */}
          <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
            <ProfileHeader />
            <ActiveTabSwitch />
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeTab === "chats" ? <ChatList /> : <ContactList />}

            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1 flex flex-col bg-slate-900/500 backdrop-blur-sm">
            {selectedUser ? <ChatContainer/> : <NoConversationPlaceHolder/>}
          </div>
        </BorderAnimatedContainer>

      </div>
  )
}

export default ChatPage