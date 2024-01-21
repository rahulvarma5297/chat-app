import React, { useState, useEffect } from "react";
import "./Welcome.css";

export default function Welcome() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserName(
      JSON.parse(localStorage.getItem(process.env.KEY))
        .username
    );
  }, []);

  return (
    <div className="welcome">
      <h1>
        Hi, <span>{userName}!</span>
      </h1>
      <h3>Select a chat to Start messaging.</h3>
    </div>
  );
}
