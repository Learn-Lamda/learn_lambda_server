import { ClassConstructor } from "class-transformer";
import { FeatureHttpController } from "../../core/controllers/feature_http_controller";
import {
  CallbackStrategyCreateDbModel,
  CallBackStrategyPagination,
  CallbackStrategyUpdateModel,
  CallbackStrategyWithEmpty,
  CallBackStrategyWithQueryPage,
  CallBackStrategyDeleteModelByQueryId,
  ResponseBase,
  SubRouter,
} from "../../core/controllers/http_controller";
import { Result } from "../../core/helpers/result";
import { Prisma } from "@prisma/client";
import { TaskEditModel, TaskValidationModel } from "./model/task";

export class CurrentTasksCollection extends CallbackStrategyWithEmpty {
  call = async (): ResponseBase => Result.ok(this.currentSession);
}

export class GetAllTasks extends CallBackStrategyPagination<Prisma.TaskWhereInput> {
  dbCollectionName: string = "task";
}

export class EditTask extends CallbackStrategyUpdateModel<TaskEditModel> {
  validationModel: ClassConstructor<TaskEditModel> = TaskEditModel;
  dbCollectionName: string = "task";
}

export class CreateTask extends CallbackStrategyCreateDbModel<TaskValidationModel> {
  dbCollectionName: string = "task";
  validationModel: ClassConstructor<TaskValidationModel> = TaskValidationModel;
}
export class DeleteTask extends CallBackStrategyDeleteModelByQueryId {
  dbCollectionName: string = "task";
}
export class TasksFeature extends FeatureHttpController {
  constructor() {
    super();
    this.subRoutes = [
      new SubRouter("/all-tasks", new GetAllTasks()),
      new SubRouter("/create-task", new CreateTask()),
      new SubRouter("/edit/task", new EditTask()),
      new SubRouter("/delete/task", new DeleteTask()),
    ];
  }
}
