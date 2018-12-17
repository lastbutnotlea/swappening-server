import * as Bluebird from 'bluebird';
import { Item, ItemAddModel, ItemModel, ItemViewModel } from '../models/item.model';
import { UserService } from './user.service';
import { Picture, PictureAddModel, PictureViewModel } from '../models/picture.model';
import { Sequelize } from 'sequelize';

export class ItemService {

  static get itemAttributes() {
    return ['id', 'headline', 'description'];
  }

  static get pictureAttributes() {
    return ['pictureStorageName', 'itemId', 'originalName'];
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

  public updateItem({ id, headline, description, ownerId }: ItemModel) {
    let promises: Sequelize.Promise[] = [];
    if (headline != null) {
      promises.push(Item.update({
        headline: headline,
      }, {
        where: { id: id },
      }));
    }
    if (description != null) {
      promises.push(Item.update({
        description: description,
      }, {
        where: { id: id },
      }));
    }
    if (ownerId != null) {
      promises.push(Item.update({
        ownerId: ownerId,
      }, {
        where: { id: id },
      }));
    }
    return Promise.all(promises).then(() => this.getItemById(id));
  }

  /**
   * Returns the item for a given id
   * @param id
   */
  public getItemById(id: number) {
    Item.hasMany(Picture, { foreignKey: 'itemId' });
    Picture.belongsTo(Item, { foreignKey: 'itemId' });

    return Item.findByPk(id, {
      attributes: ItemService.itemAttributes,
      include: [Picture],
      order: [
        [Picture, 'updatedAt', 'desc'],
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
    Item.hasMany(Picture, { foreignKey: 'itemId' });
    Picture.belongsTo(Item, { foreignKey: 'itemId' });

    return Item.findAll({
      order: [
        [Sequelize.literal('RANDOM()')],
        [Picture, 'updatedAt', 'desc'],
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
    Item.hasMany(Picture, { foreignKey: 'itemId' });
    Picture.belongsTo(Item, { foreignKey: 'itemId' });

    return Item.findAll({
      where: { ownerId: userId },
      attributes: ItemService.itemAttributes,
      include: [Picture],
      order: [
        [Picture, 'updatedAt', 'desc']
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
   * returns all Pictures to a given item
   * @param id the item id
   */
  public getAllPicturesByItemId(id: number) {
    return Picture.findAll({
      where: { itemId: id },
      attributes: ItemService.pictureAttributes,
    }) as Array<Bluebird<PictureViewModel>>;
  }
}
