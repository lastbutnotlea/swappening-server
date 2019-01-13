import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";
import { Item } from "./item.model";
import { Tag } from "./tag.model";

export interface TaggedItemAddModel {
  tagId: number;
  itemId: number;
}

export interface TaggedItemModel extends Sequelize.Model<TaggedItemViewModel, TaggedItemAddModel> {
  id: number;
  tagId: number;
  itemId: number;
}

export interface TaggedItemViewModel {
  id: number;
  tagId: number;
  itemId: number;
}

export const TaggedItem = sequelize.define<TaggedItemViewModel, TaggedItemAddModel>("taggedItem", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tagId: {
    type: Sequelize.INTEGER,
    references: {
      model: Tag,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  itemId: {
    type: Sequelize.INTEGER,
    references: {
      model: Item,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
});

TaggedItem.sync();
