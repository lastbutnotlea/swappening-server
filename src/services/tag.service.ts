import { Sequelize } from "sequelize";
import { Tag, TagAddModel } from "../models/tag.model";

export class TagService {

  /*
    static get itemAttributes() {
      return ['id', 'headline', 'description'];
    }

    static get pictureAttributes() {
      return ['pictureStorageName', 'itemId', 'originalName'];
    }
    */

  /**
   * Returns the tag id if exists otherwise -1
   * @param tagName
   */
  public async getTagIdByTagName(tagName: string) {
    const tag = await Tag.findOne({ where: { tagName } });
    if (tag == null) {
      return await this.addTag(tagName);
    } else {
      return tag.id;
    }
  }

  private addTag(tagName: string) {
    return Tag.create({tagName}).dataValues;
  }

}
