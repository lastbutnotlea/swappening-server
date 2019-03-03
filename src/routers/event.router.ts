import { Router } from "express";
import { matchedData } from "express-validator/filter";
import { validationResult } from "express-validator/check";
import { eventRules } from "../rules/event.rules";
import { EventAddModel, EventModel } from "../models/event.model";
import { EventService } from "../services/event.service";
import { PictureAddModel } from "../models/picture.model";
import * as multer from "multer";
import { UserService } from "../services/user.service";
import { TaggedEventService } from "../services/taggedEvent.service";
import { TagService } from "../services/tag.service";
import { TaggedEventAddModel, TaggedEventModel, TaggedEventViewModel } from "../models/taggedEvent.model";
import { AuthorizationService } from "../services/authorization.service";
import { TagModel, TagViewModel } from "../models/tag.model";

export const eventRouter = Router();
const eventService = new EventService();
const taggedEventService = new TaggedEventService();
const tagService = new TagService();

// setup
const UPLOAD_PATH = "uploads";
const upload = multer({ dest: `${UPLOAD_PATH}/` }); // multer configuration

/**
 * Route for uploading images
 */
eventRouter.post("/", eventRules.eventAdd, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }

  const ownerId: number = UserService.getUserFromToken(req.headers.authorization.split(" ")[1]);

  const payloadEvent = matchedData(req) as EventAddModel;
  // ToDo: remove this for production
  if (payloadEvent.startTime.toString() === "") {
    payloadEvent.startTime = new Date(Date.now());
  }
  let event = await eventService.addEvent(payloadEvent, ownerId);

  const tagArray = req.body.tags;

  if (tagArray !== null) {
    for (const tagElement of tagArray) {
      const tag = await tagService.getTagByTagName(tagElement);
      if (tag !== null) {
        const tagToEvent: TaggedEventAddModel = {
          tagId: tag.id,
          eventId: event.id,
        };
        await taggedEventService.addTagToEvent(tagToEvent);
      }
    }
  }

  event = await eventService.getEventById(event.id);
  return res.json(event);
});

/**
 * Returns all event data.
 * Pictures have to be loaded manually later
 */
eventRouter.get("/:id", async (req, res) => {
  if (await AuthorizationService.isOwnerEventIdSameAsUserId(eventService, req)) {
    return res.status(401).json("Unauthorized");
  }
  const event = eventService.getEventById(req.params.id);
  return event.then((u) => res.json(u));
});

/**
 * Route for deleting an events
 */
eventRouter.delete("/:id", async (req, res) => {
  let event = await eventService.getEventById(req.params.id);
  if (event == null) {
    return res.status(404).json("No Event with ID " + req.params.id + " found!");
  }

  if (await AuthorizationService.isOwnerEventIdSameAsUserId(eventService, req)) {
    return res.status(401).json("Not authorized to delete event!");
  }

  eventService.deleteEvent(req.params.id);
  return res.status(200).json("success");
});

/**
 * Returns all event data.
 * Pictures have to be loaded manually later
 */
eventRouter.put("/:id", async (req, res) => {
  // TODO Verify id
  // TODO Verify user id
  const newEvent: EventModel = {
    id: req.params.id,
    headline: req.body.headline,
    description: req.body.description,
    ownerId: req.body.ownerId,
    place: req.body.place,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    isPrivate: req.body.isPrivate,
    hasChat: req.body.hasChat,
    isVisible: req.body.isVisible,
    createdAt: "",
    updatedAt: "",
  };

  const tagArray = req.body.taggedEvents;

  if (tagArray !== null) {
    await taggedEventService.clearTagDataOfEvent(req.params.id);
    for (const tagElement of tagArray) {
      const tag = await tagService.getTagByTagName(tagElement);
      if (tag !== null) {
        const tagToEvent: TaggedEventAddModel = {
          tagId: tag.id,
          eventId: req.params.id,
        };
        await taggedEventService.addTagToEvent(tagToEvent);
      }
    }
  }

  const event = await eventService.updateEvent(newEvent);

  return res.json(event);
});

/**
 * Returns number of next events for a certain user.
 * Pictures have to be loaded manually later
 */
eventRouter.get("/forUser/:userId/:number/:tagFilter?/:stringFilter?", async (req, res) => {
  // TODO Verify id

  let tagFilter: TaggedEventViewModel[];
  let stringFilter: string = req.params.stringFilter;
  if (req.params.stringFilter === undefined){
    stringFilter = null;
  }
  if (req.params.tagFilter !== undefined && req.params.tagFilter !== "") {
    tagFilter = req.params.tagFilter.split(",").map(async (tagString) => {
      return tagService.getTagByTagName(tagString);
    });
    Promise.all(tagFilter).then((tagFilterDone) => {
        let tagFilterString = tagFilterDone.map(tag => {
          if (tag !== null)
            return ""+tag.id;
          else return "0";
        });
        const event = eventService.getEventsForUser(req.params.userId, req.params.number, tagFilterString, req.params.stringFilter);
        return event.then((u) => res.json(u.slice(1, +req.params.number + 1)));
      },
    );
  } else {
    const event = eventService.getEventsForUser(req.params.userId, req.params.number, null, req.params.stringFilter);
    return event.then((u) => res.json(u.slice(1, +req.params.number + 1)));
  }


})
;

/**
 * Returns all events of a certain user.
 * Pictures have to be loaded manually later
 */
eventRouter.get("/ofUser/:userId", (req, res) => {
  // TODO Verify id
  const event = eventService.getEventsOfUser(req.params.userId);
  return event.then((u) => res.json(u));
});

/**
 * Returns all liked events of a certain user.
 * Pictures have to be loaded manually later
 */
eventRouter.get("/forUser/liked", (req, res) => {
  const userId: number = UserService.getUserFromToken(req.headers.authorization.split(" ")[1]);
  const event = eventService.getLikedEventsOfUser(userId);
  return event.then((u) => res.json(u));
});

/**
 * Returns all events of a certain user where he has been accepted.
 * Pictures have to be loaded manually later
 */
eventRouter.get("/forUser/accepted", (req, res) => {
  const userId: number = UserService.getUserFromToken(req.headers.authorization.split(" ")[1]);
  const event = eventService.getAcceptedEventsOfUser(userId);
  return event.then((u) => res.json(u));
});

/**
 * Endpoint for swiping items left or right
 */
eventRouter.post("/swipe/:direction/:eventId", (req, res) => {
  const userId: number = UserService.getUserFromToken(req.headers.authorization.split(" ")[1]);
  let isLeft: boolean;
  if (req.params.direction === "left") {
    isLeft = true;
  } else if (req.params.direction === "right") {
    isLeft = false;
  } else {
    return res.status(400).json("Not a left or right swipe");
  }
  const response = eventService.swipeEvent(req.params.eventId, userId, isLeft);
  return response.then((m) => {
    return res.status(200).json(m);
  }).catch(function(err) {
    return res.status(422).send(err.errors);
  });
});

/**
 * Endpoint for accepting or declining users
 */
eventRouter.post("/swipeUser/:direction/:userId/:id", async (req, res) => {
  if (await AuthorizationService.isOwnerEventIdSameAsUserId(eventService, req)) {
    return res.status(401).json("Unauthorized");
  }

  let isLeft: boolean;
  if (req.params.direction === "left") {
    isLeft = true;
  } else if (req.params.direction === "right") {
    isLeft = false;
  } else {
    return res.status(400).json("Not a left or right swipe");
  }
  const response = eventService.swipeUser(req.params.id, req.params.userId, isLeft);
  return response.then((m) => {
    return res.status(200).json(m);
  }).catch(function(err) {
    return res.status(422).send(err.errors);
  });
});


/**
 *  This is a endpoint for uploading form-data which contains the image and the eventId for the image
 */
eventRouter.post("/image", upload.single("data"), (req, res) => {
  // TODO Verify these Parameters
  const payload: PictureAddModel = {
    eventId: req.body.eventId,
    originalName: req.file.originalname,
    pictureStorageName: req.file.filename,
  };
  const picture = eventService.addPicture(payload);

  return picture.then((u) => res.json(u));
});

/**
 * Route for deleting an event
 */
eventRouter.delete("/image/:storageName", (req, res) => {
  // TODO Protect
  res.json(eventService.deletePicture(req.params.storageName));
});

eventRouter.put("/image/updateOrder/:eventId", (req, res) => {
  const event = eventService.updateImageOrder(req.body, req.params.eventId);
  return event.then((u) =>
    res.json(u));
});
