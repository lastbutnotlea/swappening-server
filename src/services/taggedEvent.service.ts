import { Sequelize } from "sequelize";
import { TaggedEvent, TaggedEventAddModel, TaggedEventModel, TaggedEventViewModel } from "../models/taggedEvent.model";
import * as Bluebird from "bluebird";

export class TaggedEventService {

  static get taggedEventAttributes() {
    return ["id", "tagId", "eventId"];
  }

  /**
   * Adds an tag for a event
   * @param tagId
   * @param eventId
   */
  public addTagToEvent({ tagId, eventId }: TaggedEventAddModel) {
    return TaggedEvent.create({ tagId, eventId })
      .then((u) => this.getTaggedEventById(u.id));
  }

  public getTaggedEventById(id: number) {
    return TaggedEvent.findOne({
      where: { id },
      attributes: TaggedEventService.taggedEventAttributes,
    }) as Bluebird<TaggedEventViewModel>;
  }

  public clearTagDataOfEvent(id: number){
    return TaggedEvent.destroy({
      where: {eventId: id},
    });
  }
}
