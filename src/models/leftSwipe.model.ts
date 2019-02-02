import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";
import { Event } from "./event.model";
import { User } from "./user.model";

export interface LeftSwipeModel {
  eventId: number;
  userId: number;
}

export const LeftSwipe = sequelize.define<LeftSwipeModel>("leftSwipes", {
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
}, {
  classMethods: {
    associate() {
      User.belongsToMany(Event, { through: LeftSwipe });
      Event.belongsToMany(User, { through: LeftSwipe });
    },
  },
});


LeftSwipe.sync();
