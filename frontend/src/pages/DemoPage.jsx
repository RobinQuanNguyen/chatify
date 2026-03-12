import { useState, useRef } from "react"
import { useNavigate } from "react-router"
import BorderAnimatedContainer from "../components/BorderAnimatedContainer.jsx"
import {
  MessageCircleIcon,
  LogOutIcon,
  Volume2Icon,
  XIcon,
  ImageIcon,
  SendIcon,
  UsersIcon,
  UserIcon,
} from "lucide-react"

// ─── Demo Profile Header ────────────────────────────────────────────────────

function DemoProfileHeader() {
  const navigate = useNavigate()

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative size-14">
            <div className="size-14 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <UserIcon className="size-7 text-cyan-400" />
            </div>
            <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-green-500 ring-2 ring-slate-800" />
          </div>
          <div>
            <h3 className="text-slate-200 font-medium text-base">Your Name</h3>
            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        <div className="flex gap-4 items-center opacity-50 cursor-default">
          <button
            className="text-red-400 hover:text-green-300 transition-colors"
            onClick={() => navigate("/login")}
            >
            <LogOutIcon className="size-5"/>
          </button>
          <Volume2Icon className="size-5 text-slate-400" />
        </div>
      </div>
    </div>
  )
}

// ─── Demo Tab Switch ─────────────────────────────────────────────────────────

function DemoTabSwitch({ activeTab, setActiveTab }) {
  return (
    <div className="tabs tabs-boxed bg-transparent p-2 m-2">
      <button
        onClick={() => setActiveTab("chats")}
        className={`tab ${activeTab === "chats" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"}`}
      >
        Chats
      </button>
      <button
        onClick={() => setActiveTab("contacts")}
        className={`tab ${activeTab === "contacts" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"}`}
      >
        Contacts
      </button>
    </div>
  )
}

// ─── Demo List ───────────────────────────────────────────────────────────────

function DemoList({ activeTab }) {
  return (
    <div className="flex flex-col items-center justify-start text-center space-y-3 pt-8 px-4">
      <div className="w-14 h-14 bg-cyan-500/10 rounded-full flex items-center justify-center">
        {activeTab === "chats"
          ? <MessageCircleIcon className="w-7 h-7 text-cyan-400" />
          : <UsersIcon className="w-7 h-7 text-cyan-400" />
        }
      </div>

      <p className="text-slate-300 text-sm font-medium">
        {activeTab === "chats"
          ? "Chat list will show all your active conversations"
          : "Contact list will show all registered users of the app"
        }
      </p>
      <p className="text-slate-500 text-xs">
        {activeTab === "chats"
          ? "Each entry shows the partner's avatar, name, and online status"
          : "Click any contact to open a conversation with them"
        }
      </p>
    </div>
  )
}

// ─── Demo Chat Header ────────────────────────────────────────────────────────

function DemoChatHeader() {
  const navigate = useNavigate()

  return (
    <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-[84px] px-6 flex-1">
      <div className="flex items-center space-x-3">
        <div className="relative size-12">
          <div className="size-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <UserIcon className="size-6 text-cyan-400" />
          </div>
        </div>
        <div>
          <h3 className="text-slate-200 font-medium">Contact's name will appear here</h3>
          <p className="text-slate-400 text-sm">Online / Offline status</p>
        </div>
      </div>
      <button
            className="w-5 h-5 text-red-400 hover:text-green-300 transition-colors opacity-50 cursor-default"
            onClick={() => navigate("/login")}
            >
            <XIcon />
          </button>
    </div>
  )
}

// ─── Demo Message Area ───────────────────────────────────────────────────────

function DemoMessageArea() {
  return (
    <div className="flex-1 px-6 overflow-y-auto py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Date divider */}
        <div className="flex justify-center my-4">
          <div className="px-4 py-1 rounded-full text-xs bg-slate-700/50 text-slate-200">
            Messages are grouped by date
          </div>
        </div>

        {/* Received message example */}
        <div className="chat chat-start">
          <div className="chat-bubble bg-slate-500 text-slate-200">
            <p>Messages from your contact will appear on the left</p>
            <p className="text-xs mt-1 opacity-75">10:30 AM</p>
          </div>
        </div>

        {/* Sent message example */}
        <div className="chat chat-end">
          <div className="chat-bubble bg-cyan-600 text-white">
            <p>Your messages will appear on the right</p>
            <p className="text-xs mt-1 opacity-75">10:31 AM</p>
          </div>
        </div>

        {/* Message with image example */}
        <div className="chat chat-start">
          <div className="chat-bubble bg-slate-500 text-slate-200">
            <div className="rounded-lg h-24 bg-slate-600/60 flex items-center justify-center mb-2 w-48">
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <ImageIcon className="size-6" />
                <span className="text-xs">Shared images appear here</span>
              </div>
            </div>
            <p className="text-xs mt-1 opacity-75">10:32 AM</p>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Demo Message Input ──────────────────────────────────────────────────────

function DemoMessageInput() {
  const [text, setText] = useState("")
  const fileInputRef = useRef(null)

  return (
    <div className="p-4 border-t border-slate-700/50">
      <form
        className="max-w-3xl mx-auto flex space-x-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4 text-slate-200 placeholder-slate-500"
          placeholder="Type your message..."
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-4 transition-colors"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}

// ─── Demo Banner ─────────────────────────────────────────────────────────────

function DemoBanner() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-3 bg-cyan-500/10 border-b border-cyan-500/20">
      <p className="text-slate-300 text-sm">
        Register or log in to start your conversation with everybody.
      </p>
      <button
        onClick={() => navigate("/login")}
        className="shrink-0 px-4 py-1.5 text-sm font-medium text-cyan-400 bg-cyan-500/20 rounded-lg hover:bg-cyan-500/30 transition-colors whitespace-nowrap"
      >
        Log in / Sign up
      </button>
    </div>
  )
}

// ─── Demo Page ───────────────────────────────────────────────────────────────

function DemoPage() {
  const [activeTab, setActiveTab] = useState("chats")

  return (
    <div className="relative w-full max-w-6xl h-[800px]">
      <BorderAnimatedContainer>

        {/* LEFT SIDE */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <DemoProfileHeader />
          <DemoTabSwitch activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <DemoList activeTab={activeTab} />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
          <DemoChatHeader />
          <DemoBanner />
          <DemoMessageArea />
          <DemoMessageInput />
        </div>

      </BorderAnimatedContainer>
    </div>
  )
}

export default DemoPage
