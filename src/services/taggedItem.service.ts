import { Sequelize } from "sequelize";
import { TaggedItem, TaggedItemAddModel, TaggedItemModel, TaggedItemViewModel } from "../models/taggedItem.model";
import * as Bluebird from "bluebird";

export class TaggedItemService {

  static get taggedItemAttributes() {
    return ["id", "tagId", "itemId"];
  }

  /**
   * Adds an tag for a item
   * @param tagId
   * @param itemId
   */
  public addTagToItem({ tagId, itemId }: TaggedItemAddModel) {
    return TaggedItem.create({ tagId, itemId })
      .then((u) => this.getTaggedItemById(u.id));
  }

  public getTaggedItemById(id: number) {
    return TaggedItem.findOne({
      where: { id },
      attributes: TaggedItemService.taggedItemAttributes,
    }) as Bluebird<TaggedItemViewModel>;
  }
}
