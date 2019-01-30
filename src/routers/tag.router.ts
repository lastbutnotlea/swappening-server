import { Router } from "express";
import { TagService } from "../services/tag.service";

export const tagRouter = Router();
const tagService = new TagService();

/**
 * Returns all event data.
 * Pictures have to be loaded manually later
 */
tagRouter.get("/", (req, res) => {
  const tags = tagService.getAllTags();
  return tags.then((u) => res.json(u));
});
