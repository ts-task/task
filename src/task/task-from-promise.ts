import { Task } from './task';

declare module './task' {
    // tslint:disable-next-line:interface-name
    namespace Task {
        function fromPromise<TResult, EResult = any> (promise: Promise<TResult>): Task<TResult, EResult>;
    }
}
Task.fromPromise = function <TResult, EResult = any> (promise: Promise<TResult>): Task<TResult, EResult> {
    return new Task((outerResolve, outerReject) => {
        promise.then(outerResolve, err => outerReject(err));
    });
};
