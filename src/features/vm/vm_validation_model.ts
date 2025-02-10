import { IsString } from "class-validator";




export class VmValidationModel {
    @IsString()
    code: string;
    @IsString()
    token: string;
    @IsString()
    taskId: string;
    
}