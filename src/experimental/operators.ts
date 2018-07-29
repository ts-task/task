import { Task } from '../task/task';
import { UncaughtError } from '../task/uncaught-error';

export function toPromise <T> (task: Task<T, any>) {
    return new Promise<T>((resolve, reject) =>
        task.fork(reject, resolve)
    );
}

export function share<T, E> () {
    let result: Promise<T> | undefined;
    return function (input: Task<T, E>): Task<T, E> {
        return new Task((outerResolve, outerReject) => {
            if (typeof result === 'undefined') {
                result = toPromise(input);
            }
            result
                .then(outerResolve, outerReject);
        });
    };
}
