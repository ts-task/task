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
