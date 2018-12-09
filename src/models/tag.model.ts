import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";

export interface TagAddModel {
  tag: string;
}

export interface TagModel extends Sequelize.Model<TagViewModel, TagAddModel> {
  id: number;
  tag: string;
}

export interface TagViewModel {
  id: number;
  tag: string;
}

export const Tag = sequelize.define<TagViewModel, TagAddModel>("tag", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tag: Sequelize.STRING,
});

Tag.sync();
