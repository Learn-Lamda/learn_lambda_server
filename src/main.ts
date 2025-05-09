import "reflect-metadata";
import { App } from "./core/controllers/app";
import { extensions } from "./core/extensions/extensions";
import { httpRoutes } from "./core/controllers/routes";
import { SocketSubscriber } from "./core/controllers/socket_controller";
import { VmUseCase } from "./features/vm/vm_controller";



extensions();

const socketSubscribers: SocketSubscriber<any>[] = [];

new App(httpRoutes.map((el) => el.call()), socketSubscribers).listen();

// new VmUseCase().call(`console.log(2);
// console.log(2);
// 10 + 10;
// console.log(2);`).map((el) => console.log(JSON.stringify(el)));
