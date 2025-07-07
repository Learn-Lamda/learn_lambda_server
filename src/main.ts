import "reflect-metadata";
import { App } from "./core/controllers/app";
import { extensions } from "./core/extensions/extensions";
import { httpRoutes } from "./core/controllers/routes";
import { SocketSubscriber } from "./core/controllers/socket_controller";
import { gptChatPresentation } from "./features/gpt_chat/gpt_chat";
import { PrismaClient } from "@prisma/client";

extensions();

const socketSubscribers: SocketSubscriber<any>[] = [
  new SocketSubscriber(gptChatPresentation, "gpt"),
];

(async () => {
  console.log(await new PrismaClient().task.count());
  // await new PrismaClient().task.create({
  //   data: {
  //     name: "123",
  //     description: "132",
  //     code: "321",
  //     test: "123",
  //     complexity: 123,
  //   },
  // });
  new App(
    await Promise.all(httpRoutes.map(async (el) => await el.call())),
    socketSubscribers
  ).listen();
})();
