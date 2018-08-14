import { IMapFn, Task } from '../task/task';
import { UncaughtError } from '../task/uncaught-error';

export function map<T1, T2> (fn: IMapFn<T1, T2>) {
    return function <E>  (input: Task<T1, E>): Task<T2, E | UncaughtError> {
        return new Task((outerResolve, outerReject) => {
            input.fork(
                outerReject,
                value => {
                    try {
                        const result = fn(value);
                        outerResolve(result);
                    } catch (error) {
                        outerReject(new UncaughtError(error));
                    }
                }
            );
        });
    };
}
