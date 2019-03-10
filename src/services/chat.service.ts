import { Sequelize, Op } from "sequelize";
import * as Bluebird from "bluebird";

import {
  MessageUserEvent,
  MessageUserEventAddModel,
  MessageUserEventViewModel,
} from "../models/messageUserEvent.model";
import { ChatUserEvent, ChatUserEventAddModel, ChatUserEventViewModel } from "../models/chatUserEvent.model";
import { EventService } from "./event.service";

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
      where: { chatId },
      attributes: ["isMessageOfOwner", "message", "createdAt"],
      order: ["createdAt"],
    }) as Bluebird<MessageUserEventViewModel>;
  }

  public createNewUserEventChat(newChat: ChatUserEventAddModel) {
    return ChatUserEvent.create(newChat);
  }

  public getAllChatsOfUser(userId: number) {
    return ChatUserEvent.findAll({
      where: { [Op.or]: [{ ownerId: userId }, { userId: userId }] },
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
  async initChat(eventId: any, userId: any) {
    const ownerId = await EventService.getOwnerIdById(eventId);
    return ChatUserEvent.findOrCreate({
      where: {
        userId,
        eventId,
      },
      defaults: {
        ownerId,
      },
    });
  }

  public getChatById(id: number) {
    return ChatUserEvent.findOne({
      where: { id },
    }) as Bluebird<ChatUserEventViewModel>;
  }

  public deleteChat(id: number) {
    const promises: Sequelize.Promise[] = [];
    MessageUserEvent.findAll({ where: { chatId: id } }).then((res) => {
      res.forEach((message) => {
        promises.push(MessageUserEvent.destroy({ where: { id: message.id } }));
      });
      Promise.all(promises).then(() => {
        ChatUserEvent.destroy({ where: { id } });
      });
    });
  }

  public deleteAllChatsOfEvent(eventId: number) {
    const promises: Sequelize.Promise[] = [];
    ChatUserEvent.findAll({ where: { eventId } }).then((chats) => {
      chats.forEach((chat) => {
        MessageUserEvent.findAll({ where: { chatId: chat.id } }).then((messages) => {
          messages.forEach((message) => {
            promises.push(MessageUserEvent.destroy({ where: { id: message.id } }));
          });
          Promise.all(promises).then(() => {
            return ChatUserEvent.destroy({ where: { id: chat.id } });
          });
        });
      });
    });
  }
}
