import "reflect-metadata";
import { App } from "./core/controllers/app";
import { extensions } from "./core/extensions/extensions";
import { httpRoutes } from "./core/controllers/routes";
import { SocketSubscriber } from "./core/controllers/socket_controller";
import { gptChatPresentation } from "./features/gpt_chat/gpt_chat";
import * as dotenv from 'dotenv';


dotenv.config();
extensions();

const socketSubscribers: SocketSubscriber<any>[] = [
  new SocketSubscriber(gptChatPresentation, "gpt"),
];

(async () => {
  new App(
    await Promise.all(httpRoutes.map(async (el) => await el.call())),
    socketSubscribers
  ).listen();
})();
