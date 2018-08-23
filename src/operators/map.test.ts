import { assertFork, jestAssertNever } from '../../test/jest-helper';
import { map } from '../operators';
import { Task } from '../task';
import { UncaughtError } from '../task/uncaught-error';

describe('Task', () => {
    describe('map', () => {
        it('Should handle transformation functions (dot-chaining)', (cb) => {
            // GIVEN: a resolved value
            const task = Task.resolve(0);

            // WHEN: we transform the value
            const result = task.map(n => '' + n);

            // THEN: the success function should be called with the transformed value
            result.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe('0'))
            );
        });

        it('Should handle transformation functions (pipe)', (cb) => {
            // GIVEN: a resolved value
            const task = Task.resolve(0);

            // WHEN: we transform the value
            const result = task.pipe(
                map(n => '' + n),
            );

            // THEN: the success function should be called with the transformed value
            result.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe('0'))
            );
        });

        it('Should handle functions that throw', (cb) => {
            // GIVEN: a resolved value
            const resolved = Task.resolve(0);

            // WHEN: we map with a transformation that throws
            const result = resolved.map(n => {throw new Error('buu'); });

            // THEN: the error handler should be called
            result.fork(
                assertFork(cb, x => expect(x instanceof UncaughtError).toBe(true)),
                jestAssertNever(cb)
            );
        });

        it('Should propagate error', (cb) => {
            // GIVEN: a rejected Task
            const rejected = Task.reject('buu');

            // WHEN: we map the function, THEN: the mapped function is never called
            const result = rejected.map(jestAssertNever(cb));

            // ...and the error propagates
            result.fork(
                assertFork(cb, x => expect(x).toBe('buu')),
                jestAssertNever(cb)
            );
        });

    });
});
