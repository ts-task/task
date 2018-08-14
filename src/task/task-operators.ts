import { UncaughtError } from '.';
import { catchError, chain, map } from '../operators';
import { IMapFn, ITaskChainFn, Task } from './task';

// This is a helper file to include the basic operators inside Task
// and avoid a cyclic dependency.
declare module './task' {
    // tslint:disable-next-line:interface-name
    interface Task <T, E> {
        map<TResult> (fn: IMapFn<T, TResult>): Task<TResult, E | UncaughtError>;
        chain<TResult, EResult> (fn: ITaskChainFn<T, TResult, EResult>): Task < TResult, E | EResult | UncaughtError >;
        catch <TResult, EResult> (fn: ITaskChainFn<E, TResult, EResult>): Task<T | TResult, EResult | UncaughtError>;
    }
}

Task.prototype.map = function <T, TResult>
    (fn: IMapFn<T, TResult>) {
        return map(fn)(this);
};

Task.prototype.chain = function <T, TResult, EResult >
    (fn: ITaskChainFn<T, TResult, EResult>) {
        return chain<T, TResult, EResult>(fn)(this);
};

Task.prototype.catch = function <E, TResult, EResult>
    (fn: ITaskChainFn<E, TResult, EResult>) {
        return catchError<TResult, E, EResult>(fn)(this);
};
