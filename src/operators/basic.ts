import { Task, UncaughtError } from '../task';

export type IMapFn <A, B> = (a: A) => B;
export type ITaskChainFn<A, B, E> = (value: A) => Task<B, E>;
export type IPipeFn<T1, T2, E1, E2> = (a: Task<T1, E1>) => Task<T2, E2>;

export function map<T1, T2, E> (fn: IMapFn<T1, T2>) {
    return function (input: Task<T1, E>): Task<T2, E | UncaughtError> {
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

export function chain<T1, T2, E1, E2> (fn: ITaskChainFn<T1, T2, E2>) {
    return function (input: Task<T1, E1>): Task<T2, E1 | E2 | UncaughtError> {
        return new Task((outerResolve, outerReject) => {
            input.fork(
                outerReject,
                value => {
                    try {
                        fn(value).fork(outerReject, outerResolve);
                    }
                    catch (err) {
                        outerReject(new UncaughtError(err));
                    }
                }
            );
        });
    };
}

export function catchError<T1, T2, E1, E2> (fn: ITaskChainFn<E1, T2, E2>) {
    return function (input: Task<T1, E1>): Task<T1 | T2, E2 | UncaughtError> {
        return new Task((outerResolve, outerReject) => {
            input.fork(
                err => {
                    try {
                        fn(err).fork(outerReject, outerResolve);
                    }
                    catch (err) {
                        outerReject(new UncaughtError(err));
                    }
                },
                outerResolve
            );
        });
    };
}

