import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";
import { Event } from "./event.model";

export interface PictureAddModel {
  pictureStorageName: string;
  eventId: number;
  originalName: string;
}

export interface PictureModel extends Sequelize.Model<PictureViewModel, PictureAddModel> {
  pictureStorageName: string;
  eventId: number;
  originalName: string;
  order: number;
}

export interface PictureViewModel {
  pictureStorageName: string;
  eventId: number;
  originalName: string;
  order: number;
}

export const Picture = sequelize.define<PictureViewModel, PictureAddModel>("pictures_event", {
  pictureStorageName: {
    type: Sequelize.STRING(32),
    primaryKey: true,
  },
  eventId: {
    type: Sequelize.INTEGER,
    references: {
      model: Event,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  originalName: {
    type: Sequelize.STRING(64),
  },
  order: {
    type: Sequelize.INTEGER,
  },
});

Picture.sync();
