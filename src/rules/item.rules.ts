import { check } from "express-validator/check";

// Apparently these need to be set or else the matching wont work
export const itemRules = {
  itemAdd: [
    check("headline")
      .exists({ checkFalsy: true }).withMessage("Item Headline must be specified"),
    check("description")
      .exists({ checkFalsy: true }).withMessage("Item Description must be specified"),
  ],
  itemGet: [
    check("itemId")
      .exists({ checkFalsy: true }).withMessage("Item Id must be specified"),
  ]
};
