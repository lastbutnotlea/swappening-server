import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";

export interface TagAddModel {
  tagName: string;
}

export interface TagModel extends Sequelize.Model<TagViewModel, TagAddModel> {
  id: number;
  tagName: string;
}

export interface TagViewModel {
  id: number;
  tagName: string;
}

export const Tag = sequelize.define<TagViewModel, TagAddModel>("tag", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tagName: Sequelize.STRING,
});

Tag.sync();
