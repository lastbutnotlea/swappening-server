import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";
import { Item } from "./item.model";

export interface PictureAddModel {
  pictureStorageName: string;
  itemId: number;
  originalName: string;
}

export interface PictureModel extends Sequelize.Model<PictureViewModel, PictureAddModel> {
  pictureStorageName: string;
  itemId: number;
  originalName: string;
  order: number;
}

export interface PictureViewModel {
  pictureStorageName: string;
  itemId: number;
  originalName: string;
  order: number;
}

export const Picture = sequelize.define<PictureViewModel, PictureAddModel>("pictures", {
  pictureStorageName: {
    type: Sequelize.STRING(32),
    primaryKey: true,
  },
  itemId: {
    type: Sequelize.INTEGER,
    references: {
      model: Item,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  originalName: {
    type: Sequelize.STRING(32),
  },
  order: {
    type: Sequelize.INTEGER,
  },
});

Picture.sync();
