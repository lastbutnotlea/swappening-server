import { Sequelize } from "sequelize";
import { Tag } from "../models/tag.model";
import { TaggedEventViewModel } from "../models/taggedEvent.model";
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
    const tagObject = await Tag.findOne({
      where: { tagName },
      attributes: TagService.tagAttributes,
    }) as Bluebird<TaggedEventViewModel>;
    return tagObject;
  }


  public getAllTagNames() {
    return Tag.findAll({});
  }

  public getTagById(id: number) {
    return Tag.findOne({
      where: { id },
      attributes: TagService.tagAttributes,
    }) as Bluebird<TaggedEventViewModel>;
  }

  private addTag(tagName: string) {
    return Tag.create({ tagName })
      .then((t) => this.getTagById(t.id));
  }

}
