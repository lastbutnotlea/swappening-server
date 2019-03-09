import { EventService } from "./event.service";
import { UserService } from "./user.service";
import { ChatUserEventViewModel } from "../models/chatUserEvent.model";

export class AuthorizationService {

  public static async isOwnerEventIdSameAsUserId(eventService: EventService, eventId: number, req: any) {
    const ownerId: number = UserService.getUserFromToken(req.headers.authorization.split(" ")[1]);
    const eventOwnerId = await EventService.getOwnerIdById(eventId);
    return eventOwnerId !== ownerId;
  }

  public static async isOwnerChatIdSameAsUserId(chat: ChatUserEventViewModel, req: any) {
    const ownerId: number = UserService.getUserFromToken(req.headers.authorization.split(" ")[1]);
    return chat.ownerId !== ownerId;
  }
}
