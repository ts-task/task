import { Task, UncaughtError } from '../../src/task';
import { asUncaughtError } from '../../src/utils/as-uncaught-error';
import { assertFork, jestAssertNever, jestAssertUntypedNeverCalled } from '../jest-helper';

describe('asUncaughtError', () => {
    it('Should catch any error', (cb) => {
        // GIVEN: A task created from a rejected promise (with any error type)
        const task = Task.fromPromise(Promise.reject('something'));

        // WHEN: We catch it as an UncaughtError
        const result = task.catch(asUncaughtError);

        // THEN: The Task is rejected with an UncaughtError and the types get more specific
        //       than any
        result.fork(
            assertFork(cb, err => expect(err).toBeInstanceOf(UncaughtError)),
            jestAssertNever(cb)
        );
    });
});
