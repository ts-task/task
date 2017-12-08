export type IMapFn <A, B> = (a: A) => B;
export type ITaskChainFn<A, B, E> = (value: A) => Task<B, E>;

export class UncaughtError extends Error {
    type: 'UncaughtError';

    constructor (private error: any) {
        super('UncaughtError: ' + error.toString());
    }
}

export class Task <T, E> {

    constructor (private fn: (resolve: (value: T) => void, reject: (err: E) => void) => void) {

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

    static fromPromise<TResult> (promise: Promise<TResult>): Task<TResult, UncaughtError> {
        return new Task((outerResolve, outerReject) => {
            promise.then(outerResolve, err => outerReject(new UncaughtError(err)));
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
            this.fn(resolve, reject);
        }).then(
            (x: any) => successFn(x),
            errorFn
        );
    }
}
