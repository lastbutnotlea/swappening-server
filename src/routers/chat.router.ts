import { Router } from "express";
import { ChatService } from "../services/chat.service";
import { chatUserEventRules } from "../rules/chatUserEvent.rules";
import { matchedData } from "express-validator/filter";
import { MessageUserEventAddModel } from "../models/messageUserEvent.model";
import { UserService } from "../services/user.service";
import { ChatUserEventAddModel } from "../models/chatUserEvent.model";
import { Socket } from "socket.io";

export const chatRouter = Router();
export const io = require("socket.io")(80);

const chatService = new ChatService();

const socketsOfUser = new Map<number, Socket>();


// ToDo: change this without user, that the user can only view his onw chats
chatRouter.get("/messages/:chatId", chatUserEventRules.messageGet, (req, res) => {
  return chatService.getMessages(req.params.chatId).then(
    (u) => res.json(u));
});

// ToDo: verify that user is the current user or always take the current user
chatRouter.post("/messages", chatUserEventRules.messageAdd, (req, res) => {
  try {
    const payloadChatMessage = matchedData(req) as MessageUserEventAddModel;

    chatService.addMessage(payloadChatMessage);
    io.emit("message", req.body);
    console.log("saved");

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    return console.log("error", error);
  } finally {
    console.log("Message Posted");
  }
});

chatRouter.post("/", (req, res) => {
  const newChat: ChatUserEventAddModel = {
    userId: req.body.userId,
    eventId: req.body.eventId,
    ownerId: req.body.ownerId,
  };

  chatService.createNewUserEventChat(newChat)
    .then((c) => res.json(c))
    .catch((e) => res.status(400).json(e));
});

chatRouter.get("/", (req, res) => {
  const userId: number = UserService.getUserFromToken(req.headers.authorization.split(" ")[1]);
  return chatService.getAllChatsOfUser(userId)
    .then( (c) => res.json(c))
    .catch((e) => res.status(400).json(e));
});


io.on("connection", (socket) => {
  socket.on("userAuth", (token) => {
    const userId: number = UserService.getUserFromToken(token);
    console.log("a user with " + userId + " is connected");
    socketsOfUser.set(userId, socket);
    socket.on("message", (chatId, chatPartnerId, isMessageOfUser, message) => {
      if (socketsOfUser.has(chatPartnerId)) {
        socketsOfUser.get(chatPartnerId).emit("message", message);
      }
      chatService.addMessage({ chatId, isMessageOfUser, message });
    });
  });

});
