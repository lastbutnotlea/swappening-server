import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";
import { User } from "./user.model";

export interface ItemAddModel {
  headline: string;
  description: string;
}

export interface ItemModel extends Sequelize.Model<ItemViewModel, ItemAddModel> {
  id: number;
  ownerId: number;
  headline: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemViewModel {
  id: number;
  headline: string;
  description: string;
}

export const Item = sequelize.define<ItemViewModel, ItemAddModel>("item", {
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
});

Item.sync();
