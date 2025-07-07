import { IsInt, IsString, Max, Min } from "class-validator";
export abstract class EditModel {
  id: number;
}
export class TaskValidationModel {
  @IsString()
  description: string;
  @IsString()
  name: string;
  @IsString()
  code: string;
  @IsString()
  test: string;
  @IsInt()
  @Min(1)
  @Max(3)
  complexity: number;
}
export class TaskEditModel extends TaskValidationModel implements EditModel {
  @IsInt()
  id: number;
}
