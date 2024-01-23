const Messages = require("../models/messageModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ createdAt: 1 });

    const displayChat = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from, // stores boolean value
        message: msg.message.text,
      };
    });
    res.json(displayChat);
  } catch (err) {
    next(err);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (err) {
    next(err);
  }
};

module.exports.addMessageNats = async (body) => {
  try {
    const { from, to, msg } = body;
    const data = await Messages.create({
      message: { text: msg },
      users: [from, to],
      sender: from,
    });

    if (data) return { msg: "Message added successfully." };
    else return { msg: "Failed to add message to the database" };
  } catch (err) {
    console.log(err.message);
  }
};
