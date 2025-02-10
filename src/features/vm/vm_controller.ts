
import { CoreHttpController } from "../../core/controllers/http_controller";
import { VmValidationModel } from "./vm_validation_model";
import { Result } from "../../core/helpers/result";
import { VM } from "vm2";
import * as tsNode from 'ts-node';
interface VMContext {
    line: number;
    code: string;
    error?: any;
    success: boolean;
}


export class VmUseCase {
    call = (code: string): Result<void, VMContext[]> => {
        try {
            return Result.ok(tsNode.create().compile(code, '/vm_validation_model.ts').split('\n').map<VMContext>((line, index) => {
                line.trim()
                if (line.isEmpty()) {
                    try {
                        const result = new VM().run(line);
                        return { line: index + 1, code: line, result, success: true };

                    } catch (error) {
                        return { line: index + 1, code: line, error: error.message, success: false };

                    }
                }
                return { line: index + 1, code: line, success: true };
            }));
        } catch (error) {
            return Result.ok()
        }
    }
}
export class VmController extends CoreHttpController<VmValidationModel> {
    constructor() {
        super({ url: "/vm" });
        this.subRoutes.push()
    }
}