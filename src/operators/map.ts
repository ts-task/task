import { IMapFn, Task } from '../task/task';
import { UnknownError } from '../task/unknown-error';

export function map<T1, T2> (fn: IMapFn<T1, T2>) {
    return function <E>  (input: Task<T1, E>): Task<T2, E | UnknownError> {
        return new Task((outerResolve, outerReject) => {
            input.fork(
                outerReject,
                value => {
                    try {
                        const result = fn(value);
                        outerResolve(result);
                    } catch (error) {
                        outerReject(new UnknownError(error));
                    }
                }
            );
        });
    };
}
