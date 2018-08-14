import { assertFork, jestAssertNever, jestAssertUntypedNeverCalled } from '../../test/jest-helper';
import { Task } from './index';

describe('Task', () => {
    describe('fromPromise', () => {
        it('Should work with resolved promises', (cb) => {
            // GIVEN: A task created from a resolved promise
            const resolved = Task.fromPromise(Promise.resolve(0));

            // WHEN: we fork, THEN: it should call the success function with the resolved value
            resolved.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe(0)),
            );

        });

        it('Should work with rejected promises', (cb) => {
            // GIVEN: A task created from a rejected promise
            const resolved = Task.fromPromise(Promise.reject('buu'));

            // WHEN: we fork, THEN: it should call the error function with the rejected value
            resolved.fork(
                assertFork(cb, x => expect(x).toBe('buu')),
                jestAssertNever(cb)
            );
        });

        it('Should mantain any error when changed', (cb) => {
            // GIVEN: A task created from a rejected promise
            const task = Task.fromPromise(Promise.reject('buu'));

            // WHEN: we chain it with some value
            const result = task.chain(_ => Task.resolve(0));
            // THEN: the task type should be Task<number, any> (check manually?)

            // and the error should be the same
            result.fork(
                assertFork(cb, x => expect(x).toBe('buu')),
                jestAssertUntypedNeverCalled(cb)
            );
        });

        it('Should be able to set rejected type', (cb) => {
            // GIVEN: A task created from a rejected promise
            const resolved = Task.fromPromise<never, string>(Promise.reject('buu'));

            // WHEN: we fork, THEN: it should call the error function with the rejected value
            resolved.fork(
                assertFork(cb, x => expect(x).toBe('buu')),
                jestAssertNever(cb)
            );
        });
    });
});
