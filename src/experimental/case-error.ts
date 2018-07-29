import { Task } from '../task/task';

export type Constructor<T> = { new(...args: any[]): T; };

export type IErrorHandler<E, TResult, EResult> = (err: E) => Task<TResult, EResult>;

export function caseError <E, TResult, EResult> (errorType: Constructor<E>, errorHandler: IErrorHandler<E, TResult, EResult>) {
    return function <RE> (err: RE | E): Task<TResult, RE | EResult> {
        // If the error is of the type we are looking for (E)
        if (err instanceof errorType) {
            // Transform the error
            return errorHandler(err as E);
        } else {
            // If not, leave as it is
            return Task.reject(err as RE);
        }
    };
}
