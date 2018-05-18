import { catchError, chain, IMapFn, IPipeFn, ITaskChainFn, map } from './operators/basic';


export class UncaughtError extends Error {
    type: 'UncaughtError' = 'UncaughtError';

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
    static all <T, E> (tasks: Array<Task<T, E>>): Task<[T], E>;
    static all (tasks: any): any {
        // Flag to track if any Task has resolved
        let rejected = false;
        // Array that we'll fill with the resolved values, in order
        const resolvedValues: any[] = [];
        // Counter of resolved Tasks (we can't use resolvedValues.length since we add elements through index)
        let resolvedQty = 0;

        return new Task((outerResolve, outerReject) => {
            tasks.forEach((aTask: any, index: number) => {
                aTask
                    .fork((err: any) => {
                        // We do only reject if there was no previous rejection
                        if (!rejected) {
                            rejected = true;
                            outerReject(err);
                        }
                    }, (x: any) => {
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

    pipe (): Task<T, E>;
    pipe<T1, E1> (f1: IPipeFn<T, T1, E, E1>): Task<T1, E1 | UncaughtError>;
    pipe<T1, T2, E1, E2> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>): Task<T2, E2 | UncaughtError>;
    pipe<T1, T2, T3, E1, E2, E3> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>): Task<T3, E3 | UncaughtError>;
    pipe<T1, T2, T3, T4, E1, E2, E3, E4> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>): Task<T4, E4 | UncaughtError>;
    pipe<T1, T2, T3, T4, T5, E1, E2, E3, E4, E5> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>): Task<T5, E5 | UncaughtError>;
    pipe<T1, T2, T3, T4, T5, T6, E1, E2, E3, E4, E5, E6> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>): Task<T6, E6 | UncaughtError>;
    pipe<T1, T2, T3, T4, T5, T6, T7, E1, E2, E3, E4, E5, E6, E7> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>, f7: IPipeFn<T6, T7, E6, E7>): Task<T7, E7 | UncaughtError>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, E1, E2, E3, E4, E5, E6, E7, E8> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>, f7: IPipeFn<T6, T7, E6, E7>, f8: IPipeFn<T7, T8, E7, E8>): Task<T8, E8 | UncaughtError>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, E1, E2, E3, E4, E5, E6, E7, E8, E9> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>, f7: IPipeFn<T6, T7, E6, E7>, f8: IPipeFn<T7, T8, E7, E8>, f9: IPipeFn<T8, T9, E8, E9>): Task<T9, E9 | UncaughtError>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, E1, E2, E3, E4, E5, E6, E7, E8, E9, E10> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>, f7: IPipeFn<T6, T7, E6, E7>, f8: IPipeFn<T7, T8, E7, E8>, f9: IPipeFn<T8, T9, E8, E9>, f10: IPipeFn<T9, T10, E9, E10>): Task<T10, E10 | UncaughtError>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, E1, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>, f7: IPipeFn<T6, T7, E6, E7>, f8: IPipeFn<T7, T8, E7, E8>, f9: IPipeFn<T8, T9, E8, E9>, f10: IPipeFn<T9, T10, E9, E10>, f11: IPipeFn<T10, T11, E10, E11>): Task<T11, E11 | UncaughtError>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, E1, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11, E12> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>, f7: IPipeFn<T6, T7, E6, E7>, f8: IPipeFn<T7, T8, E7, E8>, f9: IPipeFn<T8, T9, E8, E9>, f10: IPipeFn<T9, T10, E9, E10>, f11: IPipeFn<T10, T11, E10, E11>, f12: IPipeFn<T11, T12, E11, E12>): Task<T12, E12 | UncaughtError>;
    pipe<TFinal, EFinal> (...fns: any[]): Task<TFinal, EFinal | UncaughtError> {
        return new Task((outerResolve, outerReject) => {
            const newTask = fns.reduce(
                (task, f) => {
                    try {
                        return f(task);
                    } catch (err) {
                        return Task.reject(new UncaughtError(err));
                    }
                },
                this
            );
            return newTask.fork(outerReject, outerResolve);
        });
    }

    map<TResult> (fn: IMapFn<T, TResult>): Task<TResult, E | UncaughtError> {
        return map<T, TResult, E>(fn)(this);
    }

    chain<TResult, EResult> (fn: ITaskChainFn<T, TResult, EResult>): Task<TResult, E | EResult | UncaughtError> {
        return chain<T, TResult, E, EResult>(fn)(this);
    }

    catch<TResult, EResult> (fn: ITaskChainFn<E, TResult, EResult>): Task<T | TResult, EResult | UncaughtError> {
        return catchError<T, TResult, E, EResult>(fn)(this);
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

