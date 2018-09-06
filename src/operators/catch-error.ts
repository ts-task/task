import { ITaskChainFn, Task } from '../task/task';
import { UnknownError } from '../task/unknown-error';

export function catchError<T2, E1, E2> (fn: ITaskChainFn<E1, T2, E2>) {
    return function <T1> (input: Task<T1, E1>): Task<T1 | T2, E2 | UnknownError> {
        return new Task((outerResolve, outerReject) => {
            input.fork(
                err => {
                    try {
                        fn(err).fork(outerReject, outerResolve);
                    }
                    catch (err) {
                        outerReject(new UnknownError(err));
                    }
                },
                outerResolve
            );
        });
    };
}