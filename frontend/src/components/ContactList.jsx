import {useChatStore} from "../store/useChatStore.js";
import UsersLoadingSkeleton from "./UserLoadingSkeleton";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";


function ContactList() {
  const { getAllContacts, allContact, isUserLoading, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts()
  }, [getAllContacts]);

  console.log("All Contacts:", allContact)

  if (isUserLoading) {
    return (
      <UsersLoadingSkeleton/>
    )
  }

  return (
    <>
      {allContact.map((contact) => (
        <div
          key={contact._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(contact._id) ? 'online' : 'offline'}`}>
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/default_avatar.png"} alt={contact.fullName}/>
              </div>      
            </div>
            <h4 className="text-slate-200 font-medium truncate">{contact.fullName}</h4>
          </div>
        </div>
      ))}
    </>
  )
}

export default ContactList