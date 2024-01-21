import React from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import axios from "axios";
import { logoutRoute } from "../utils/APIRoutes";

export default function Logout() {
  const navigate = useNavigate();
  const handleClick = async () => {
    const id = await JSON.parse(
      localStorage.getItem(process.env.KEY)
    )._id;
    const data = await axios.get(`${logoutRoute}/${id}`);
    if (data.status === 200) {
      localStorage.clear();
      navigate("/login");
    }
  };

  const buttonStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    backgroundColor: "#1c2838",
    cursor: "pointer",
    color: "white",
  };

  return (
    <div onClick={handleClick} style={buttonStyle}>
      <BiPowerOff />
    </div>
  );
}
