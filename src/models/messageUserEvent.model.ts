import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";
import { ChatUserEvent, ChatUserEventAddModel } from "./chatUserEvent.model";

export interface MessageUserEventAddModel {
  chatId: number;
  isMessageOfOwner: boolean;
  message: string;
}

export interface MessageUserEventModel extends Sequelize.Model<MessageUserEventViewModel, MessageUserEventAddModel> {
  id: number;
  chatId: number;
  isMessageOfOwner: boolean;
  message: string;
  createdAt: string;
}

export interface MessageUserEventViewModel {
  chatId: number;
  isMessageOfOwner: boolean;
  message: string;
  createdAt: string;
}

export const MessageUserEvent = sequelize.define<MessageUserEventModel, MessageUserEventAddModel>("messageUserEvent", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  chatId: {
    type: Sequelize.INTEGER,
    references: {
      model: ChatUserEvent,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  isMessageOfOwner: Sequelize.BOOLEAN,
  message: Sequelize.STRING,
});

MessageUserEvent.sync();
