export type IMapFn <A, B> = (a: A) => B;
export type ITaskChainFn<A, B, E> = (value: A) => Task<B, E>;

export class UncaughtError extends Error {
    type: 'UncaughtError';

    constructor (private error: any) {
        super('UncaughtError: ' + error.toString());
    }
}

/**
 * Asynchronous Task, like a promise but lazy and typed on error
 * @param T Type of the Task value on success
 * @param E Type of the Task error on failure
 */
export class Task <T, E> {

    /**
     * Creates a new task using a `resolver` function. Pretty much like a promise creation
     *
     * ```
     * const task = new Task((resolve, reject) => {
     *   setTimeout(_ => resolve('value'), 1000)
     * })
     * ```
     *
     * @param resolver Function to resolve or reject the task
     *
     */
    constructor (private resolver: (resolve: (value: T) => void, reject: (err: E) => void) => void) {

    }

    static resolve<T> (value: T): Task<T, never> {
        return new Task(resolve => {
            resolve(value);
        });
    }

    static reject<E, T = never> (error: E): Task<T, E> {
        return new Task((resolve, reject) => {
            reject(error);
        });
    }

    static fromPromise<TResult, EResult = any> (promise: Promise<TResult>): Task<TResult, EResult> {
        return new Task((outerResolve, outerReject) => {
            promise.then(outerResolve, err => outerReject(err));
        });
    }

    static all <T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, E1, E2, E3, E4, E5, E6, E7, E8, E9, E10> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>, Task<T5, E5>, Task<T6, E6>, Task<T7, E7>, Task<T8, E8>, Task<T9, E9>, Task<T10, E10>]): Task<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9 | E10>;
    static all <T1, T2, T3, T4, T5, T6, T7, T8, T9, E1, E2, E3, E4, E5, E6, E7, E8, E9> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>, Task<T5, E5>, Task<T6, E6>, Task<T7, E7>, Task<T8, E8>, Task<T9, E9>]): Task<[T1, T2, T3, T4, T5, T6, T7, T8, T9], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9>;
    static all <T1, T2, T3, T4, T5, T6, T7, T8, E1, E2, E3, E4, E5, E6, E7, E8> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>, Task<T5, E5>, Task<T6, E6>, Task<T7, E7>, Task<T8, E8>]): Task<[T1, T2, T3, T4, T5, T6, T7, T8], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8>;
    static all <T1, T2, T3, T4, T5, T6, T7, E1, E2, E3, E4, E5, E6, E7> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>, Task<T5, E5>, Task<T6, E6>, Task<T7, E7>]): Task<[T1, T2, T3, T4, T5, T6, T7], E1 | E2 | E3 | E4 | E5 | E6 | E7>;
    static all <T1, T2, T3, T4, T5, T6, E1, E2, E3, E4, E5, E6> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>, Task<T5, E5>, Task<T6, E6>]): Task<[T1, T2, T3, T4, T5, T6], E1 | E2 | E3 | E4 | E5 | E6>;
    static all <T1, T2, T3, T4, T5, E1, E2, E3, E4, E5> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>, Task<T5, E5>]): Task<[T1, T2, T3, T4, T5], E1 | E2 | E3 | E4 | E5>;
    static all <T1, T2, T3, T4, E1, E2, E3, E4> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>]): Task<[T1, T2, T3, T4], E1 | E2 | E3 | E4>;
    static all <T1, T2, T3, E1, E2, E3> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>]): Task<[T1, T2, T3], E1 | E2 | E3>;
    static all <T1, T2, E1, E2> (tasks: [Task<T1, E1>, Task<T2, E2>]): Task<[T1, T2], E1 | E2>;
    static all <T1, E1> (tasks: [Task<T1, E1>]): Task<[T1], E1>;
    static all <T, E> (tasks: Task<T, E>[]) {
        // Flag to track if any Task has resolved
        let rejected = false;
        // Array that we'll fill with the resolved values, in order
        const resolvedValues: T[] = [];
        // Counter of resolved Tasks (we can't use resolvedValues.length since we add elements through index)
        let resolvedQty = 0;

        return new Task((outerResolve, outerReject) => {
            tasks.forEach((aTask, index) => {
                aTask
                    .fork(err => {
                        // We do only reject if there was no previous rejection
                        if (!rejected) {
                            rejected = true;
                            outerReject(err);
                        }
                    }, x => {
                        // Shouldn't resolve if another Task has rejected
                        if (rejected) {
                            return;
                        }

                        // Track resolved value (in order)
                        resolvedValues[index] = x;
                        // ...and how many tasks has resolved
                        resolvedQty++;
                        if (resolvedQty === tasks.length) {
                            outerResolve(resolvedValues);
                        }
                    });
            });
        });
    }

    map<TResult> (fn: IMapFn<T, TResult>): Task<TResult, E | UncaughtError> {
        return new Task((outerResolve, outerReject) => {
            this.fork(
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
    }

    chain<TResult, EResult> (fn: ITaskChainFn<T, TResult, EResult>): Task<TResult, E | EResult | UncaughtError> {
        return new Task((outerResolve, outerReject) => {
            this.fork(
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
    }

    catch<TResult, EResult> (fn: ITaskChainFn<E, TResult, EResult>): Task<T | TResult, EResult | UncaughtError> {
        return new Task((outerResolve, outerReject) => {
            this.fork(
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
    }

    fork (errorFn: (error: E) => any, successFn: (value: T) => any): void {
        new Promise((resolve, reject) => {
            this.resolver(resolve, reject);
        }).then(
            (x: any) => successFn(x),
            errorFn
        );
    }
}
