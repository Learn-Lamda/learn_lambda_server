
import { CallbackStrategyWithValidationModel, CoreHttpController, ResponseBase, SubRouter } from "../../core/controllers/http_controller";
import { VmValidationModel } from "./vm_validation_model";
import { Result } from "../../core/helpers/result";
import { VM } from "vm2";
import * as tsNode from 'ts-node';
type Statuses = 'ok' | 'error' | 'nocode';
interface VMContext {
    line: number;
    error?: any;
    status: Statuses;
}


export class VmUseCase {

    call = (code: string): Result<void, VMContext[]> => {
        try {
            let globalLine = 0;
            const logs = [];
            let vm = new VM({
                sandbox: {
                    console: {
                        log: (...args) => {
                            logs.push({ log: args.join(' '), line: globalLine });
                        }
                    }
                },
            });
            const codeLog = tsNode.create().compile(code, '/vm_validation_model.ts').split('\n').removeFromEnd().map<VMContext>((line, index) => {
                globalLine = index;
                console.log(line);
                if (line.trim().isNotEmpty()) {
                    try {
                        vm.run(line)
                        return { line: index + 1, out: logs.find((el) => el.line === index), status: 'ok' };

                    } catch (error) {
                        return { line: index + 1, error: error.message, status: 'error' };
                    }
                } else {
                    return { line: index + 1, status: 'nocode' };
                }

            });
            console.log(codeLog);
            return Result.ok(codeLog);
        } catch (error) {
            return Result.ok()
        }
    }
}

export class RunVm extends CallbackStrategyWithValidationModel<VmValidationModel> {
    validationModel: VmValidationModel = new VmValidationModel();
    async call(model: VmValidationModel): ResponseBase {
        return Result.ok(new VmUseCase().call(model.code));
    }

}
export class VmController extends CoreHttpController<VmValidationModel> {
    constructor() {
        super({ url: "vm", validationModel: VmValidationModel });
        // this.post = new RunVm().call
        this.routes.POST = new RunVm().call
        // this.subRoutes.push(new SubRouter<VmValidationModel>("POST", "/run", new RunVm()))
    }
}