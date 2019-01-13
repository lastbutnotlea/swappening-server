import { Sequelize } from "sequelize";
import { TaggedItem, TaggedItemAddModel, TaggedItemModel, TaggedItemViewModel } from "../models/taggedItem.model";
import * as Bluebird from "bluebird";

export class TaggedItemService {

  static get taggedItemAttributes() {
    return ["id", "headline", "description"];
  }

  /**
   * Adds an tag for a item
   * @param tagId
   * @param itemId
   */
  public addTagToItem({ tagId, itemId }: TaggedItemAddModel) {
    return TaggedItem.create({ tagId, itemId })
      .then((u) => {
        if (u != null) {
          console.debug("created tag for item");
        } else {
          console.debug("Tag for Item was NOT created");
        }
      });
  }

  public getTaggedItemById(id: number) {
    return TaggedItem.findOne({
      where: { id: id },
      attributes: TaggedItemService.taggedItemAttributes,
    }) as Bluebird<TaggedItemViewModel>;
  }
}
