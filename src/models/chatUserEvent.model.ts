import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";
import { Event } from "./event.model";
import { User } from "./user.model";

export interface ChatUserEventAddModel {
  userId: number;
  eventId: number;
  ownerId: number;
}

export interface ChatUserEventModel extends Sequelize.Model<ChatUserEventViewModel, ChatUserEventAddModel> {
  id: number;
  userId: number;
  eventId: number;
  ownerId: number;
}

export interface ChatUserEventViewModel {
  id: number;
  userId: number;
  eventId: number;
  ownerId: number;
}

export const ChatUserEvent = sequelize.define<ChatUserEventModel, ChatUserEventAddModel>("chatUserEvent", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  eventId: {
    type: Sequelize.INTEGER,
    references: {
      model: Event,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  ownerId: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
});

ChatUserEvent.sync();
