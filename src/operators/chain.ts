import { ITaskChainFn, Task } from '../task/task';
import { UnknownError } from '../task/unknown-error';

export function chain<T1, T2, E2> (fn: ITaskChainFn<T1, T2, E2>) {
    return function <E1> (input: Task<T1, E1>): Task<T2, E1 | E2 | UnknownError> {
        return new Task((outerResolve, outerReject) => {
            input.fork(
                outerReject,
                value => {
                    try {
                        fn(value).fork(outerReject, outerResolve);
                    }
                    catch (err) {
                        outerReject(new UnknownError(err));
                    }
                }
            );
        });
    };
}