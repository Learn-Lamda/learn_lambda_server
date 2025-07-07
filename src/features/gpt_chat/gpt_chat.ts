import { SocketSubscriber } from "../../core/controllers/socket_controller";
import { Result } from "../../core/helpers/result";
import { TypedEvent } from "../../core/helpers/typed_event";
interface GptResponse {}

export class GptChatPresentation extends TypedEvent<Result<void, GptResponse>> {}

export const gptChatPresentation = new GptChatPresentation();
