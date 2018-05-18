import { Task } from '../task';
// TODO: move to experimental
export type Constructor<T> = { new(...args: any[]): T; };

export type IErrorHandler<E, TResult, EResult> = (err: E) => Task<TResult, EResult>;
export function caseError <E, TResult, EResult> (errorType: Constructor<E>, errorHandler: IErrorHandler<E, TResult, EResult>) {
    return function <RE> (err: RE | E): Task<TResult, RE | EResult> {
        if (err instanceof errorType) {
            return errorHandler(err);
        } else {
            return Task.reject(err);
        }
    };
}