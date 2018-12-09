import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";

export interface UserAddModel {
  email: string;
  password: string;
  nickName: string;
}

export interface UserModel extends Sequelize.Model<UserModel, UserAddModel> {
  id: number;
  email: string;
  nickName: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserViewModel {
  id: number;
  email: string;
}

export const User = sequelize.define<UserModel, UserAddModel>("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  nickName: Sequelize.STRING,
});

User.sync();
