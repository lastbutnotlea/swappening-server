import * as Sequelize from "sequelize";
import { sequelize } from "../instances/sequelize";
import { Event } from "./event.model";
import { Tag } from "./tag.model";

export interface TaggedEventAddModel {
  tagId: number;
  eventId: number;
}

export interface TaggedEventModel extends Sequelize.Model<TaggedEventViewModel, TaggedEventAddModel> {
  id: number;
  tagId: number;
  eventId: number;
}

export interface TaggedEventViewModel {
  id: number;
  tagId: number;
  eventId: number;
}

export const TaggedEvent = sequelize.define<TaggedEventViewModel, TaggedEventAddModel>("taggedEvent", {
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
  eventId: {
    type: Sequelize.INTEGER,
    references: {
      model: Event,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
});

TaggedEvent.sync();
