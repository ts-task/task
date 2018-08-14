import { assertFork, jestAssertNever, jestAssertUntypedNeverCalled } from '../../test/jest-helper';
import { Task } from '../task';
import { UncaughtError } from '../task/uncaught-error';

describe('Task', () => {
    describe('chain', () => {
        it('Should handle functions that succeed', (cb) => {
            // GIVEN: a resolved value
            const resolved = Task.resolve(1);

            // WHEN: we chain it with another task that succeed
            const result = resolved.chain(n => Task.resolve(n * 2));

            // THEN: the success handler should be called with the chained result
            result.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe(2))
            );
        });

        it('Should handle functions that throw', (cb) => {
            // GIVEN: a resolved value
            const resolved = Task.resolve(0);

            // WHEN: we chain with a function that throws
            const result = resolved.chain(n => {throw new Error('buu'); });

            // THEN: the error handler should be called
            result.fork(
                assertFork(cb, x => {expect(x).toBeInstanceOf(UncaughtError); }),
                jestAssertUntypedNeverCalled(cb)
            );
        });

        it('Should propagate error', (cb) => {
            // GIVEN: a rejected Task
            const rejected = Task.reject('buu');

            // WHEN: we chain the function, THEN: the chained function is never called
            const result = rejected.chain(jestAssertNever(cb));

            // ...and the error propagates
            result.fork(
                assertFork(cb, x => expect(x).toBe('buu')),
                jestAssertUntypedNeverCalled(cb)
            );
        });

        it('Should handle rejection in the chained function', (cb) => {
            // GIVEN: a resolved value
            const resolved = Task.resolve(1);

            // WHEN: we chained with a rejected value
            const result = resolved.chain(_ => Task.reject('buu'));

            // THEN: the error handler should be called with the rejected value
            result.fork(
                assertFork(cb, x => expect(x).toBe('buu')),
                jestAssertNever(cb)
            );
        });
    });
});
