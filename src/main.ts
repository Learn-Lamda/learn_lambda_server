import "reflect-metadata";
import { App } from "./core/controllers/app";
import { extensions } from "./core/extensions/extensions";
import { httpRoutes } from "./core/controllers/routes";
import { SocketSubscriber } from "./core/controllers/socket_controller";
import { VmUseCase } from "./features/vm/vm_controller";



extensions();

const socketSubscribers: SocketSubscriber<any>[] = [];

// new App(httpRoutes, socketSubscribers).listen();
new VmUseCase().call(`  const a = 5;
const b = 10;
a + b;
`).map((el) => console.log(el));
new VmUseCase().call(`  const a = 5;
const b = 10;
a + b;
`).map((el) => console.log(el));
