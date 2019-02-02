import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";
import { LeftSwipe } from "./leftSwipe.model";
import { RightSwipe } from "./rightSwipe.model";

export interface UserAddModel {
  email: string;
  nickname: string;
  description: string;
  password: string;
  location: string;
  distance: number;
  pictureStorageName: string;
}

export interface UserModel extends Sequelize.Model<UserModel, UserAddModel> {
  id: number;
  email: string;
  nickname: string;
  description: string;
  password: string;
  location: string;
  distance: number;
  pictureStorageName: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserViewModel {
  nickname: string;
  description: string;
  pictureStorageName: string;
}

export const User = sequelize.define<UserModel, UserAddModel>("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  nickname: Sequelize.STRING,
  description: Sequelize.STRING,
  location: Sequelize.STRING,
  distance: Sequelize.INTEGER,
  pictureStorageName: Sequelize.STRING,
}, {
  classMethods: {
    associate() {
      User.hasMany(Event, { through: LeftSwipe });
      User.hasMany(LeftSwipe);
      User.hasMany(Event, { through: RightSwipe });
      User.hasMany(RightSwipe);
    },
  },
});

User.sync();
