import { Task, UncaughtError } from '../task';
export function asUncaughtError (error: any): Task<never, UncaughtError> {
    return Task.reject(new UncaughtError(error));
}
