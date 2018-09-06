import { assertFork, jestAssertNever } from '../../test/jest-helper';
import { Task, UnknownError } from '../task';
import { asUnknownError } from './as-unknown-error';

describe('asUnknownError', () => {
    it('Should catch any error', (cb) => {
        // GIVEN: A task created from a rejected promise (with any error type)
        const task = Task.fromPromise(Promise.reject('something'));

        // WHEN: We catch it as an UnknownError
        const result = task.catch(asUnknownError);

        // THEN: The Task is rejected with an UnknownError and the types get more specific
        //       than any
        result.fork(
            assertFork(cb, err => expect(err).toBeInstanceOf(UnknownError)),
            jestAssertNever(cb)
        );
    });
});
