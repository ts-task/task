import { UnknownError } from './unknown-error';

export type IMapFn <A, B> = (a: A) => B;
export type ITaskChainFn<A, B, E> = (value: A) => Task<B, E>;
export type IPipeFn<T1, T2, E1, E2> = (a: Task<T1, E1>) => Task<T2, E2>;

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

    static resolve<T, E = never> (value: T): Task<T, E> {
        return new Task(resolve => {
            resolve(value);
        });
    }

    // TODO: I would like to type as <T = never, E = any>
    // but typescript infers wrongly
    static reject<E, T = never> (error: E): Task<T, E> {
        return new Task((resolve, reject) => {
            reject(error);
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

