import { Task } from '../task/task';
import { UncaughtError } from '../task/uncaught-error';


export function asUncaughtError (error: any): Task<never, UncaughtError> {
    return Task.reject(new UncaughtError(error));
}
