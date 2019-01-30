import { Sequelize } from "sequelize";
import { Tag, TagAddModel } from "../models/tag.model";
import { TaggedEvent, TaggedEventViewModel } from "../models/taggedEvent.model";
import * as Bluebird from "bluebird";

export class TagService {


  static get tagAttributes() {
    return ["id", "tagName"];
  }


  /**
   * Returns the tag id if exists otherwise -1
   * @param tagName
   */
  public async getTagByTagName(tagName: string | null) {
    const tag = await Tag.findOne({
      where: { tagName },
      attributes: TagService.tagAttributes,
  }) as Bluebird<TaggedEventViewModel>;
    return tag;
  }


  public async getAllTags() {
    const tags = await Tag.findAll({
      attributes: ["tagName"],
    });
    return tags;
  }

  public getTagById(id: number) {
    return Tag.findOne({
      where: { id },
      attributes: TagService.tagAttributes,
    }) as Bluebird<TaggedEventViewModel>;
  }

  private addTag(tagName: string) {
    return Tag.create({tagName})
      .then((t) => this.getTagById(t.id));
  }

}
