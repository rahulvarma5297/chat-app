import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { allUsersRoute, host } from "../../utils/APIRoutes";
import ChatContainer from "../../components/ChatContainer/ChatContainer";
import Contacts from "../../components/Contacts/Contacts";
import Welcome from "../../components/Welcome/Welcome";
import Logout from "../../components/Logout";
import "./Chat.css";

export default function Chat() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  useEffect(async () => {
    if (!localStorage.getItem(process.env.KEY)) {
      navigate("/login");
    } else {
      setCurrentUser(await JSON.parse(localStorage.getItem(process.env.KEY)));
    }
  }, []);


  useEffect(async () => {
    if (currentUser) {
      const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
      setContacts(data.data);
    }
  }, [currentUser]);
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };
  return (
    <>
      <div className="main">
        <div>
          <Logout />
        </div>
        <div className="container">
          <Contacts contacts={contacts} changeChat={handleChatChange} />
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer currentChat={currentChat} />
          )}
        </div>
      </div>
    </>
  );
}
