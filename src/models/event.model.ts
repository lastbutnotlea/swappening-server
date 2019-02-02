import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";
import { User } from "./user.model";
import { LeftSwipe } from "./leftSwipe.model";
import { RightSwipe } from "./rightSwipe.model";

export interface EventAddModel {
  headline: string;
  description: string;
  place: string;
  startTime: Date;
  endTime: Date;
  isPrivate: boolean;
  hasChat: boolean;
  isVisible: boolean;
}

export interface EventModel extends Sequelize.Model<EventViewModel, EventAddModel> {
  id: number;
  ownerId: number;
  headline: string;
  description: string;
  place: string;
  startTime: Date;
  endTime: Date;
  isPrivate: boolean;
  hasChat: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventViewModel {
  id: number;
  ownerId: number;
  headline: string;
  description: string;
  place: string;
  startTime: Date;
  endTime: Date;
  isPrivate: boolean;
  hasChat: boolean;
  isVisible: boolean;
}

export const Event = sequelize.define<EventViewModel, EventAddModel>("event", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ownerId: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  headline: Sequelize.STRING,
  description: Sequelize.TEXT,
  place: Sequelize.TEXT,
  startTime: Sequelize.DATE,
  endTime: Sequelize.DATE,
  isPrivate: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  hasChat: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  isVisible: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
}, {
  classMethods: {
    associate() {
      Event.hasMany(User, { through: LeftSwipe });
      Event.hasMany(LeftSwipe);
      Event.hasMany(User, { through: RightSwipe });
      Event.hasMany(RightSwipe);
    },
  },
});

Event.sync();
