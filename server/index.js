const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
globalThis.WebSocket = require("websocket").w3cwebsocket;
const { connect, StringCodec } = require("nats.ws");

const app = express();
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");

const {
  addMessage,
  getMessages,
  addMessageNats,
} = require("./controllers/messageController");

app.use(cors());
app.use(express.json());

const URL = process.env.MONGO_URL;
mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Error Connecting Database: ", err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

let nc;
const sub = "rahul.*";

(async () => {
  try {
    nc = await connect({
      servers: "ws://localhost:5050",
    });
    console.log("NATS connected");
    serverSubscriber(nc, sub);
  } catch (err) {
    console.log("Error connecting NATS: ", err.message);
  }
})();

const serverSubscriber = async (nc, t) => {
  if (nc) {
    console.log("connected as Subscriber");
    const sub = nc.subscribe(t);
    for await (const m of sub) {
      const msg = StringCodec().decode(m.data);
      const data = JSON.parse(msg);
      console.log(data);
      addMessageNats(data);
    }

    console.log("subscription closed");
  } else {
    console.log("Not connected");
  }
};
