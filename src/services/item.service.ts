import * as Bluebird from "bluebird";
import { Item, ItemAddModel, ItemViewModel } from "../models/item.model";
import { UserService } from "./user.service";
import { Picture, PictureAddModel, PictureViewModel } from "../models/picture.model";

export class ItemService {

  static get itemAttributes() {
    return ["id", "headline", "description"];
  }

  static get pictureAttributes() {
    return ["pictureStorageName", "itemId", "originalName"];
  }

  public addItem({ headline, description }: ItemAddModel) {
    const ownerId: number = UserService.user.id;

    return Item.create({ ownerId, headline, description })
      .then((u) => this.getItemById(u.id));
  }

  // ToDo: Test this method
  public getAllItemsByUserId(id: number) {
    return Item.findAll({
      where: { ownerId: id },
      attributes: ItemService.itemAttributes,
    }) as Array<Bluebird<ItemViewModel>>;
  }

  public getItemById(id: number) {
    Item.hasMany(Picture, {foreignKey: "itemId"});
    Picture.belongsTo(Item, {foreignKey: "itemId"});

    return Item.findByPk(id, {
      attributes: ItemService.itemAttributes,
      include: [Picture],
    }) as Bluebird<ItemViewModel>;
  }

  public addPicture({ itemId, originalName, pictureStorageName }: PictureAddModel) {
    return Picture.create({ pictureStorageName, itemId, originalName})
      .then(() => this.getAllPicturesByItemId(itemId));
  }

  public getAllPicturesByItemId(id: number) {
    return Picture.findAll({
      where: { itemId: id },
      attributes: ItemService.pictureAttributes,
    }) as Array<Bluebird<PictureViewModel>>;
  }
}
