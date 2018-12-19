import { Router } from "express";
import { matchedData } from "express-validator/filter";
import { validationResult } from "express-validator/check";
import { itemRules } from "../rules/item.rules";
import { ItemAddModel, ItemModel } from "../models/item.model";
import { ItemService } from "../services/item.service";
import { PictureAddModel } from "../models/picture.model";
import * as multer from "multer";
import { UserService } from "../services/user.service";

export const itemRouter = Router();
const itemService = new ItemService();

// setup
const UPLOAD_PATH = "uploads";
const upload = multer({ dest: `${UPLOAD_PATH}/` }); // multer configuration

/**
 * Route for uploading images
 */
itemRouter.post("/addItem", itemRules.itemAdd, (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }

  const ownerId: number = UserService.getUserFromToken(req.headers.authorization.split(" ")[1]);

  // ToDo: This line does not work. For whatever reason
  const payload = matchedData(req) as ItemAddModel;
  const item = itemService.addItem(payload, ownerId);

  return item.then((u) => res.json(u));
});

/**
 * Returns all item data.
 * Pictures have to be loaded manually later
 */
itemRouter.get("/getItem/:id", (req, res) => {
  // TODO Verify id
  const item = itemService.getItemById(req.params.id);
  return item.then((u) => res.json(u));
});

/**
 * Route for deleting an items
 */
itemRouter.delete("/deleteItem/:id", (req, res) => {
  // TODO Protect against other users
  itemService.deleteItem(req.params.id);
  return res.status(200).json("success");
});

/**
 * Returns all item data.
 * Pictures have to be loaded manually later
 */
itemRouter.put("/updateItem/:id", (req, res) => {
  // TODO Verify id
  // TODO Verify user id
  const newItem: ItemModel = {
    id: req.params.id,
    headline: req.body.headline,
    description: req.body.description,
    ownerId: req.body.ownerId,
    createdAt: "",
    updatedAt: "",
  };
  const item = itemService.updateItem(newItem);
  return item.then((u) => res.json(u));
});

/**
 * Returns number of next items for a certain user.
 * Pictures have to be loaded manually later
 */
itemRouter.get("/getItemsForUser/:userId/:number", (req, res) => {
  // TODO Verify id
  const item = itemService.getItemsForUser(req.params.userId, req.params.number);
  return item.then((u) => res.json(u));
});

/**
 * Returns all items of a certain user.
 * Pictures have to be loaded manually later
 */
itemRouter.get("/getItemsOfUser/:userId", (req, res) => {
  // TODO Verify id
  const item = itemService.getItemsOfUser(req.params.userId);
  return item.then((u) => res.json(u));
});


/**
 *  This is a endpoint for uploading form-data which contains the image and the itemId for the image
 */
itemRouter.post("/addPictureToItem", upload.single("data"), (req, res) => {
  // TODO Verify these Parameters
  const payload: PictureAddModel = {
    itemId: req.body.itemId,
    originalName: req.file.originalname,
    pictureStorageName: req.file.filename,
  };
  const picture = itemService.addPicture(payload);

  return picture.then((u) => res.json(u));
});

/**
 * Route for deleting an item
 */
itemRouter.delete("/deletePicture/:storageName", (req, res) => {
  // TODO Protect
  itemService.deletePicture(req.params.storageName);
  return res.status(200).json("success");
});
