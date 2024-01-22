import React, { useState, useEffect, useRef } from "react";
import ChatInput from "../Input/ChatInput";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import "./ChatContainer.css";
import { sendMessageRoute, recieveMessageRoute } from "../../utils/APIRoutes";
import { connect, StringCodec } from "nats.ws";

export default function ChatContainer({ currentChat }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [commonSub, setCommonSub] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    const data = await JSON.parse(localStorage.getItem(process.env.KEY));
    const response = await axios.post(recieveMessageRoute, {
      from: data._id,
      to: currentChat._id,
    });
    setMessages(response.data);
    createCommonSub(currentChat._id, data._id);
    
  }, [currentChat]);

  

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(localStorage.getItem(process.env.KEY))._id;
      }
    };
    getCurrentChat();
  }, []);

  const createCommonSub = (user1, user2) => {
    user1 = user1.toString();
    user2 = user2.toString();
    const arr = [user1, user2];
    arr.sort();
    const topic = arr[0] + arr[1];
    setCommonSub(topic);
  };

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(localStorage.getItem(process.env.KEY));

    // publish to nats
    publisher(nc, commonSub, msg);

    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };


  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [nc, setConnection] = useState(undefined);
  const state = nc ? "connected" : "disconnected";

  const publisher = async (nc, topic, message) => {
    if (nc) {
      nc.publish(topic, message);
    }
  };

  const subscriber = async (nc, t) => {
    if (nc) {
      console.log("connected as Subscriber");
      const sub = nc.subscribe(t);
      console.log(sub);
      for await (const m of sub) {
        const msg = StringCodec().decode(m.data);
        console.log("recieved msg: ", msg);
        console.log(`[${sub.getProcessed()}]: ${StringCodec().decode(m.data)}`);
        setArrivalMessage({ fromSelf: false, message: msg });
      }

      console.log("subscription closed");
    } else {
      console.log("Not connected");
    }
  };

  useEffect(() => {
    if (nc === undefined) {
      const connectNats = async () => {
        try {
          const natsConnection = await connect({
            servers: "ws://localhost:5050",
          });
          setConnection(natsConnection);
        } catch (err) {
          console.log(err);
        }
      };
      connectNats();
    }
  }, [nc]);

  useEffect(() => {subscriber(nc, commonSub);}, [nc,commonSub])

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{currentChat.username}</h3>
        {state}
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content ">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </div>
  );
}
