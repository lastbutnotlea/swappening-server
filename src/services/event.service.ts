import * as Bluebird from "bluebird";
import { Event, EventAddModel, EventModel, EventViewModel } from "../models/event.model";
import { Picture, PictureAddModel, PictureViewModel } from "../models/picture.model";
import { LeftSwipe, LeftSwipeModel } from "../models/leftSwipe.model";
import { Op, Sequelize } from "sequelize";
import * as fs from "fs";
import { RightSwipe, RightSwipeModel } from "../models/rightSwipe.model";
import { TaggedEvent } from "../models/taggedEvent.model";
import { Tag } from "../models/tag.model";
import { ChatService } from "./chat.service";
import { TaggedEventService } from "./taggedEvent.service";

export class EventService {

  static get eventAttributes() {
    return ["id", "headline", "description", "place", "startTime", "endTime", "isPrivate", "hasChat", "isVisible"];
  }

  static get pictureAttributes() {
    return ["pictureStorageName", "eventId", "originalName"];
  }

  static get taggedEventAttributes() {
    return ["tagId"];
  }

  private taggedEventService = new TaggedEventService();
  private chatService = new ChatService();

  /**
   * Adds an event
   * @param headline
   * @param description
   * @param ownerId
   */
  public addEvent({ headline, description, place, startTime, endTime, isPrivate, hasChat, isVisible }: EventAddModel, ownerId: number) {
    return Event.create({ ownerId, headline, description, place, startTime, endTime, isPrivate, hasChat, isVisible })
      .then((u) => this.getEventById(u.id));
  }

  /**
   * Deletes an event and all pictures with given number
   * @param id
   */
  public deleteEvent(id: number) {
    const promises: Sequelize.Promise[] = [];
    promises.push(RightSwipe.destroy({ where: {eventId: id} }));
    promises.push(LeftSwipe.destroy({ where: {eventId: id} }));
    promises.push(this.chatService.deleteAllChatsOfEvent(id));
    promises.push(this.taggedEventService.clearTagDataOfEvent(id));
    /* .then Throws an error if there is no picture on an event */
    Picture.findAll({ where: { eventId: id } }).then((res) => {
      res.forEach((pic) => {
        promises.push(this.deletePicture(pic.pictureStorageName));
      });
      Promise.all(promises).then(() => {
        Event.destroy({ where: { id } });
      });
    });
  }

  public updateEvent({ id, headline, description, ownerId, place, startTime, endTime, isPrivate, hasChat, isVisible }: EventModel) {
    const promises: Sequelize.Promise[] = [];
    if (headline != null) {
      promises.push(Event.update({
        headline,
      }, {
        where: { id },
      }));
    }
    if (description != null) {
      promises.push(Event.update({
        description,
      }, {
        where: { id },
      }));
    }
    if (ownerId != null) {
      promises.push(Event.update({
        ownerId,
      }, {
        where: { id },
      }));
    }
    if (place != null) {
      promises.push(Event.update({
        place,
      }, {
        where: { id },
      }));
    }
    if (startTime != null) {
      promises.push(Event.update({
        startTime,
      }, {
        where: { id },
      }));
    }
    if (endTime != null) {
      promises.push(Event.update({
        endTime,
      }, {
        where: { id },
      }));
    }
    if (isPrivate != null) {
      promises.push(Event.update({
        isPrivate,
      }, {
        where: { id },
      }));
    }
    if (hasChat != null) {
      promises.push(Event.update({
        hasChat,
      }, {
        where: { id },
      }));
    }
    if (isVisible != null) {
      promises.push(Event.update({
        isVisible,
      }, {
        where: { id },
      }));
    }
    return Promise.all(promises).then(() => this.getEventById(id));
  }

  /**
   * Returns the event for a given id
   * @param id
   */
  public getEventById(id: number) {
    Event.hasMany(Picture, { foreignKey: "eventId" });
    Picture.belongsTo(Event, { foreignKey: "eventId" });
    Event.hasMany(TaggedEvent, { foreignKey: "eventId" });
    TaggedEvent.belongsTo(Event, { foreignKey: "eventId" });
    Tag.hasMany(TaggedEvent, { foreignKey: "tagId" });
    TaggedEvent.belongsTo(Tag, { foreignKey: "tagId" });


    return Event.findByPk(id, {
      attributes: EventService.eventAttributes,
      include: [Picture,
        {
          model: TaggedEvent,
          required: false,
          attributes: EventService.taggedEventAttributes,
          include:
            {
              model: Tag,
              attributes: ["tagName"],
            },
        }],
      order: [
        [Picture, "order", "asc"],
      ],
    });
  }


  /**
   * Returns the id of the event for the a given id
   * @param id
   */
  public static async getOwnerIdById(id: number) {
    Event.hasMany(Picture, { foreignKey: "eventId" });
    Picture.belongsTo(Event, { foreignKey: "eventId" });

    const eventOwnerId = await (Event.findByPk(id, {
      attributes: ["ownerId"],
    }) as Bluebird<{ ownerId: number }>);
    if (eventOwnerId !== null) {
      return eventOwnerId.ownerId;
    } else {
      return null;
    }
  }

  /**
   * Gets a numer of events for a given user to watch next
   * // TODO this is just returning random events right now
   * @param userId
   * @param count
   * @param tagFilter
   * @param stringFilter
   */
  public getEventsForUser(userId: number, count: number, tagFilter: string[], stringFilter: string) {
    Event.hasMany(Picture, { foreignKey: "eventId" });
    Picture.belongsTo(Event, { foreignKey: "eventId" });
    Event.hasMany(LeftSwipe, { foreignKey: "eventId" });
    LeftSwipe.belongsTo(Event, { foreignKey: "eventId" });
    Event.hasMany(RightSwipe, { foreignKey: "eventId" });
    RightSwipe.belongsTo(Event, { foreignKey: "eventId" });
    Event.hasMany(TaggedEvent, { foreignKey: "eventId" });
    TaggedEvent.belongsTo(Event, { foreignKey: "eventId" });
    TaggedEvent.belongsTo(Tag, { foreignKey: "tagId" });


    return Event.findAll({
      limit: count,
      include: [
        {
          model: Picture,
          duplicating: false,
        },
        {
          model: LeftSwipe,
          attributes: ["userId"],
          where: {
            userId,
          },
          required: false,
          duplicating: false,
        },
        {
          model: RightSwipe,
          attributes: ["userId"],
          where: {
            userId,
          },
          required: false,
          duplicating: false,
        },
        {
          model: TaggedEvent,
          attributes: EventService.taggedEventAttributes,
          required: false,
          include:
            {
              model: Tag,
              attributes: ["tagName"],
            },
          duplicating: false,
        },
      ],
      where: {
        "$leftSwipes.userId$": null,
        "$rightSwipes.userId$": null,
        ownerId: { [Op.ne]: userId },
        ...(tagFilter != null && { "$taggedEvents.tagId$": tagFilter }),

        ...(stringFilter != null && {
          headline: Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("headline")), "LIKE", "%" + stringFilter.toLowerCase() + "%"),
        }),
      },
      order: [
        ["id", "asc"],
      ], attributes: EventService.eventAttributes,

    }).then(res => {
      res.forEach((event) => {
        event.pictures_events.sort((a, b) => {
          return a.order > b.order;
        });
      });
      return res;
    });
  }

  /**
   * Gets all events of a given user
   * @param userId
   */
  public getEventsOfUser(userId: number) {
    Event.hasMany(Picture, { foreignKey: "eventId" });
    Picture.belongsTo(Event, { foreignKey: "eventId" });
    Event.hasMany(TaggedEvent, { foreignKey: "eventId" });
    TaggedEvent.belongsTo(Event, { foreignKey: "eventId" });
    Tag.hasMany(TaggedEvent, { foreignKey: "tagId" });
    TaggedEvent.belongsTo(Tag, { foreignKey: "tagId" });

    return Event.findAll({
      where: { ownerId: userId },
      attributes: EventService.eventAttributes,
      include: [Picture, {
        model: TaggedEvent,
        required: false,
        attributes: EventService.taggedEventAttributes,
        include:
          {
            model: Tag,
            attributes: ["tagName"],
          },
      }],
      order: [
        [Picture, "order", "asc"],
      ],
    }) as Bluebird<EventViewModel>;
  }

  /**
   * Gets all liked events of a given user
   * @param userId
   */
  public getLikedEventsOfUser(userId: number) {
    Event.hasMany(Picture, { foreignKey: "eventId" });
    Picture.belongsTo(Event, { foreignKey: "eventId" });
    Event.hasMany(RightSwipe, { foreignKey: "eventId" });
    RightSwipe.belongsTo(Event, { foreignKey: "eventId" });
    Event.hasMany(TaggedEvent, { foreignKey: "eventId" });
    TaggedEvent.belongsTo(Event, { foreignKey: "eventId" });
    Tag.hasMany(TaggedEvent, { foreignKey: "tagId" });
    TaggedEvent.belongsTo(Tag, { foreignKey: "tagId" });

    return Event.findAll({
      attributes: EventService.eventAttributes,
      include: [Picture, {
        model: TaggedEvent,
        required: false,
        attributes: EventService.taggedEventAttributes,
        include:
          {
            model: Tag,
            attributes: ["tagName"],
          },
      }, {
        model: RightSwipe,
        where: { userId },
      }],
      order: [
        [Picture, "order", "asc"],
      ],
    }) as Bluebird<EventViewModel>;
  }

  /**
   * Gets all liked events of a given user
   * @param userId
   */
  public getAcceptedEventsOfUser(userId: number) {
    Event.hasMany(Picture, { foreignKey: "eventId" });
    Picture.belongsTo(Event, { foreignKey: "eventId" });
    Event.hasMany(RightSwipe, { foreignKey: "eventId" });
    RightSwipe.belongsTo(Event, { foreignKey: "eventId" });
    Event.hasMany(TaggedEvent, { foreignKey: "eventId" });
    TaggedEvent.belongsTo(Event, { foreignKey: "eventId" });
    Tag.hasMany(TaggedEvent, { foreignKey: "tagId" });
    TaggedEvent.belongsTo(Tag, { foreignKey: "tagId" });

    return Event.findAll({
      attributes: EventService.eventAttributes,
      include: [Picture, {
        model: TaggedEvent,
        required: false,
        attributes: EventService.taggedEventAttributes,
        include:
          {
            model: Tag,
            attributes: ["tagName"],
          },
      }, {
        model: RightSwipe,
        where: { userId, accepted: true },
      }],
      order: [
        [Picture, "order", "asc"],
      ],
    }) as Bluebird<EventViewModel>;
  }

  public isUserAcceptedToEvent(eventId: number, userId: number) {
    Event.hasMany(RightSwipe, { foreignKey: "eventId" });
    RightSwipe.belongsTo(Event, { foreignKey: "eventId" });

    return RightSwipe.findAll({
      where: { userId, eventId },
    }) as Bluebird<RightSwipeModel>;
  }

  public swipeEvent(eventId: number, userId: number, isLeftSwipe: boolean) {
    if (isLeftSwipe) {
      return LeftSwipe.create({ eventId, userId }) as Bluebird<LeftSwipeModel>;
    } else {
      return Event.findOne({
        where: { id: eventId },
        attributes: ["isPrivate"],
      }).then((res) => {
        return RightSwipe.create({ eventId, userId, accepted: !res.dataValues.isPrivate }) as Bluebird<RightSwipeModel>;
      });

    }
  }

  public swipeUser(eventId: number, userId: number, isLeftSwipe: boolean) {
    if (isLeftSwipe) {
      return RightSwipe.destroy({
        where: {
          userId, eventId,
        },
      }).then(() => {
        return LeftSwipe.create({ eventId, userId }) as Bluebird<LeftSwipeModel>;
      });
    } else {
      return RightSwipe.update({
        accepted: true,
      }, {
        where: { userId, eventId },
      });
    }
  }

  /**
   * Adds a new picture to an event
   * @param eventId
   * @param originalName
   * @param pictureStorageName
   */
  public addPicture({ eventId, originalName, pictureStorageName }: PictureAddModel) {
    return Picture.create({ pictureStorageName, eventId, originalName })
      .then(() => this.getAllPicturesByEventId(eventId));
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
    ).catch((e) => {
      return e;
    });
  }

  /**
   * returns all Pictures to a given event
   * @param id the event id
   */
  public getAllPicturesByEventId(id: number) {
    return Picture.findAll({
      where: { eventId: id },
      order: [
        ["order", "asc"],
      ],
    }) as Array<Bluebird<PictureViewModel>>;
  }

  /**
   * Updates the picture order
   * @param images
   * @param eventId
   */
  public updateImageOrder(images: any[], eventId: number) {
    const promises: Sequelize.Promise[] = [];
    images.forEach((img) => {
      promises.push(Picture.update({
        order: img.order,
      }, {
        where: {
          pictureStorageName: img.pictureStorageName,
          eventId,
        },
      }));
    });

    return Promise.all(promises).then(() =>
      this.getAllPicturesByEventId(eventId));
  }
}
