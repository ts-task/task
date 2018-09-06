import { Task } from '../task/task';
import { UnknownError } from '../task/unknown-error';


export function asUnknownError (error: any): Task<never, UnknownError> {
    return Task.reject(new UnknownError(error));
}
