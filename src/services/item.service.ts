import * as Bluebird from "bluebird";
import { Item, ItemAddModel, ItemModel, ItemViewModel } from "../models/item.model";
import { Picture, PictureAddModel, PictureViewModel } from "../models/picture.model";
import { Sequelize } from "sequelize";
import * as fs from "fs";


export class ItemService {

  static get itemAttributes() {
    return ["id", "headline", "description"];
  }

  static get pictureAttributes() {
    return ["pictureStorageName", "itemId", "originalName"];
  }

  /**
   * Adds an item
   * @param headline
   * @param description
   * @param ownerId
   */
  public addItem({ headline, description }: ItemAddModel, ownerId: number) {
    return Item.create({ ownerId, headline, description })
      .then((u) => this.getItemById(u.id));
  }

  /**
   * Deletes an item and all pictures with given number
   * @param id
   */
  public deleteItem(id: number) {
    const promises: Sequelize.Promise[] = [];
    /* .then Throws an error if there is no picture on an item */
    Picture.findAll({ where: { itemId: id } }).then((res) => {
      res.forEach((pic) => {
        promises.push(this.deletePicture(pic.pictureStorageName));
      });
      Promise.all(promises).then(() => {
        Item.destroy({ where: { id } });
      });
    });
  }

  public updateItem({ id, headline, description, ownerId }: ItemModel) {
    const promises: Sequelize.Promise[] = [];
    if (headline != null) {
      promises.push(Item.update({
        headline,
      }, {
        where: { id },
      }));
    }
    if (description != null) {
      promises.push(Item.update({
        description,
      }, {
        where: { id },
      }));
    }
    if (ownerId != null) {
      promises.push(Item.update({
        ownerId,
      }, {
        where: { id },
      }));
    }
    return Promise.all(promises).then(() => this.getItemById(id));
  }

  /**
   * Returns the item for a given id
   * @param id
   */
  public getItemById(id: number) {
    Item.hasMany(Picture, { foreignKey: "itemId" });
    Picture.belongsTo(Item, { foreignKey: "itemId" });

    return Item.findByPk(id, {
      attributes: ItemService.itemAttributes,
      include: [Picture],
      order: [
        [Picture, "updatedAt", "desc"],
      ],
    }) as Bluebird<ItemViewModel>;
  }

  /**
   * Gets a numer of items for a given user to watch next
   * // TODO this is just returning random items right now
   * @param userId
   * @param number
   */
  public getItemsForUser(userId: number, number: number) {
    Item.hasMany(Picture, { foreignKey: "itemId" });
    Picture.belongsTo(Item, { foreignKey: "itemId" });

    return Item.findAll({
      order: [
        [Sequelize.literal("RANDOM()")],
        [Picture, "updatedAt", "desc"],
      ], attributes: ItemService.itemAttributes,
      limit: number,
      include: [Picture],
    }) as Bluebird<ItemViewModel>;
  }

  /**
   * Gets all items of a given user
   * @param userId
   */
  public getItemsOfUser(userId: number) {
    Item.hasMany(Picture, { foreignKey: "itemId" });
    Picture.belongsTo(Item, { foreignKey: "itemId" });

    return Item.findAll({
      where: { ownerId: userId },
      attributes: ItemService.itemAttributes,
      include: [Picture],
      order: [
        [Picture, "updatedAt", "desc"],
      ],
    }) as Bluebird<ItemViewModel>;
  }

  /**
   * Adds a new picture to an item
   * @param itemId
   * @param originalName
   * @param pictureStorageName
   */
  public addPicture({ itemId, originalName, pictureStorageName }: PictureAddModel) {
    return Picture.create({ pictureStorageName, itemId, originalName })
      .then(() => this.getAllPicturesByItemId(itemId));
  }

  /**
   * Deletes a picture from the database and removes it from storage
   * @param pictureStorageName
   */
  public deletePicture(pictureStorageName: string) {
    Picture.destroy({
      where: {
        pictureStorageName,
      },
    }).then(
      fs.unlink("uploads/" + pictureStorageName, (res) => {
        return res;
      }),
    );
  }

  /**
   * returns all Pictures to a given item
   * @param id the item id
   */
  public getAllPicturesByItemId(id: number) {
    return Picture.findAll({
      where: { itemId: id },
      order: [
        ["createdAt", "desc"],
      ],
      attributes: ItemService.pictureAttributes,
    }) as Array<Bluebird<PictureViewModel>>;
  }
}
