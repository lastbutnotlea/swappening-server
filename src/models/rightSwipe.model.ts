import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";
import { Event } from "./event.model";
import { User } from "./user.model";


export interface RightSwipeAddModel {
  eventId: number;
  userId: number;
}

export interface RightSwipeModel extends Sequelize.Model<RightSwipeAddModel> {
  eventId: number;
  userId: number;
  accepted: boolean;
}

export const RightSwipe = sequelize.define<RightSwipeModel, RightSwipeAddModel>("rightSwipes", {
  eventId: {
    type: Sequelize.INTEGER,
    references: {
      model: Event,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
    primaryKey: true,
  },
  accepted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
}, {
  classMethods: {
    associate() {
      User.belongsToMany(Event, { through: RightSwipe });
      Event.belongsToMany(User, { through: RightSwipe });
    },
  },
});

RightSwipe.sync();
