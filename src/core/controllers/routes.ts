import { AuthorizationFeature } from "../../features/authorization/authorization";
import { TasksFeature } from "../../features/tasks/tasks";
import { VmFeature } from "../../features/vm/vm";

export const httpRoutes = [
  new VmFeature(),
  new AuthorizationFeature(),
  new TasksFeature(),
];
