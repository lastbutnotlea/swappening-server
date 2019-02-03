import { Sequelize, Op } from "sequelize";
import * as Bluebird from "bluebird";

import {
  MessageUserEvent,
  MessageUserEventAddModel,
  MessageUserEventViewModel,
} from "../models/messageUserEvent.model";
import { ChatUserEvent, ChatUserEventAddModel, ChatUserEventViewModel } from "../models/chatUserEvent.model";

export class ChatService {


  // ToDo: write attributes here
  static get chatUserEventAttributes() {
    return [];
  }

  public addMessage(message: MessageUserEventAddModel) {
    return MessageUserEvent.create(message);
      // .then((t) => this.getMessageById(t.id));
  }

  public getMessages(chatId) {
    return MessageUserEvent.findAll({
      where: {chatId},
      attributes: ["messageOfUser", "message", "createdAt"],
      order: ["createdAt"],
    }) as Bluebird<MessageUserEventViewModel>;
  }

  public createNewUserEventChat(newChat: ChatUserEventAddModel) {
    return ChatUserEvent.create(newChat);
  }

  public getAllChatsOfUser(userId: number) {
    return ChatUserEvent.findAll({
      where: {[Op.or]: [{ownerId: userId}, {userId: userId}]},
    }) as Bluebird<ChatUserEventViewModel>;
  }

  /*
  // Would this even work?
  public async getOppositeChatUser(userId: number, isUser: boolean) {
    if (isUser) {
      const chat = await ChatUserEvent.findOne({
        where: {userId},
      });
      return chat.ownerId;
    } else {
      const chat = await ChatUserEvent.findOne({
        where: {ownerId: userId},
      });
      return chat.userId;
    }
  }
  */
}
