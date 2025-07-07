import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import { Server } from "socket.io";
import { createServer } from "http";
import { dirname } from "path";
import { TypedEvent } from "../helpers/typed_event";
import { Routes } from "../models/routes";
import { SocketSubscriber } from "./socket_controller";
import { userValidationMiddleware } from "../middlewares/validation_user_auth";

export enum ServerStatus {
  init = "init",
  finished = "finished",
  error = "error",
}
export enum Environment {
  DEV = "DEV",
  E2E_TEST = "E2E_TEST",
}

export class App extends TypedEvent<ServerStatus> {
  public app?: express.Application;
  public port?: number;
  public env?: Environment;
  public socketSubscribers?: SocketSubscriber<any>[];
  public io?: Server;
  status?: ServerStatus;

  constructor(
    routes: Routes[] = [],
    socketSubscribers: SocketSubscriber<any>[] = [],
    env = Environment.DEV
  ) {
    super();
    this.init(routes, socketSubscribers, env);
  }

  public init(
    routes: Routes[],
    socketSubscribers: SocketSubscriber<any>[],
    env: Environment
  ) {
    this.port = 4001;
    this.socketSubscribers = socketSubscribers;
    this.env = env;
    this.app = express();
    this.setServerStatus(ServerStatus.init);

    this.loadAppDependencies().then(() => {
      this.initializeMiddlewares();

      this.initializeRoutes(routes);
      if (this.status !== ServerStatus.error) {
        this.setServerStatus(ServerStatus.finished);
      }
    });
  }
  public listen() {
    const httpServer = createServer(this.app);
    const io = new Server(httpServer, {
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      this.socketSubscribers?.map((el) => {
        el.emitter.on((e) => {
          socket.emit(el.event, e);
        });
      });
    });

    httpServer.listen(this.port, () => {
      console.info(`=================================`);
      console.info(`======= ENV: ${this.env} =======`);
      console.info(`🚀 HTTP http://localhost:${this.port}`);
      console.info(`🚀 WS ws://localhost:${this.port}`);
      console.info(`=================================`);
    });

    this.io = io;
  }
  setServerStatus(status: ServerStatus) {
    this.emit(status);
    this.status = status;
  }
  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app?.use(cors());
    this.app?.use(express.json());
    this.app?.use(express.urlencoded({ extended: true }));
    this.app?.use(express.static(App.staticFilesStoreDir()));

    this.app?.use(
      fileUpload({
        createParentPath: true,
      })
    );
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this?.app?.use("/", route.router);
    });
  }

  async loadAppDependencies(): Promise<void> {
    // const dataBaseName = this.env === Environment.E2E_TEST ? "e2e_test" : "dev";
    // // TODO(IDONTSUDO):maybe convert it to a class and map it there
    // const result = await new DataBaseConnectUseCase().call(dataBaseName);
    // await result.fold(
    //     async (_s) => {
    //         await new CheckAndCreateStaticFilesFolderUseCase().call();
    //         // await new SetLastActivePipelineToRealTimeServiceScenario().call();
    //     },
    //     async (_e) => {
    //         this.setServerStatus(ServerStatus.error);
    //     }
    // );
  }

  static staticFilesStoreDir = () => {
    const dir = dirname(__filename);
    const rootDir = dir.slice(0, dir.length - 20);

    return rootDir + "public/";
  };
}
