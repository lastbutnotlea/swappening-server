import { Router } from "express";
import { matchedData } from "express-validator/filter";
import { validationResult } from "express-validator/check";
import { itemRules } from "../rules/item.rules";
import { ItemAddModel } from "../models/item.model";
import { ItemService } from "../services/item.service";

export const itemRouter = Router();
const itemService = new ItemService();

itemRouter.post("/addItem", itemRules.itemAdd, (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }

  // ToDo: This line does not work. For whatever reason
  const payload = matchedData(req) as ItemAddModel;
  const item = itemService.addItem(payload);

  return item.then((u) => res.json(u));
});
