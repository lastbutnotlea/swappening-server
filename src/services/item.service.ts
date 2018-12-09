import * as Bluebird from "bluebird";
import { Item, ItemAddModel, ItemViewModel } from "../models/item.model";
import { UserService } from "./user.service";

export class ItemService {

  static get itemAttributes() {
    return ["id", "headline", "description"];
  }

  public addItem({ headline, description }: ItemAddModel) {
    const ownerId: number = UserService.user.id;
    return Item.create({ ownerId, headline, description })
      .then((u) => this.getItemById(u!.id));
  }

  // ToDo: Test this method
  public getAllItemsByUserId(id: number) {
    return Item.findAll({ where: {ownerId: id},
      attributes: ItemService.itemAttributes,
    }) as Array<Bluebird<ItemViewModel>>;
  }

  public getItemById(id: number) {
    return Item.findByPk(id, {
      attributes: ItemService.itemAttributes,
    }) as Bluebird<ItemViewModel>;
  }
}
