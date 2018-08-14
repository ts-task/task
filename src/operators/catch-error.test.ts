import { assertFork, jestAssertNever, jestAssertUntypedNeverCalled } from '../../test/jest-helper';
import { Task } from '../task';
import { UncaughtError } from '../task/uncaught-error';

describe('Task', () => {
    describe('catch', () => {
        it('Should not call the function when the task is not failed', (cb) => {
            // GIVEN: a resolved task
            const task = Task.resolve('0');

            // WHEN: we catch the error, THEN: the function is never called
            const result = task.catch(x => {
                jestAssertNever(cb)(x);
                return Task.resolve(0);
            });

            // ... and the success function should be called
            result.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe('0'))
            );
        });

        it('Should resolve to the catched value from a rejected task', (cb) => {
            // GIVEN: a rejected task
            const task = Task.reject('buu');

            // WHEN: we catch the error
            const result = task.catch(x => Task.resolve(0));

            // THEN: the success function should be called
            result.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe(0))
            );
        });

        it('Should resolve to the catched value from a task that throws', (cb) => {
            // GIVEN: a resolved task with a mapped function that throws
            const task = Task
            .resolve('wii')
            .map(val => {
                const t = true;
                if (t === true) {
                    throw new Error('buu');
                }
                return val;
            });

            // WHEN: we catch the error
            const result = task.catch(x => Task.resolve(0));

            // THEN: the success function should be called
            result.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe(0))
            );
        });

        it('Should transform the error', (cb) => {
            // GIVEN: a rejected task
            const task = Task.reject('buu');

            // WHEN: we catch the error, returning a new error
            const result = task.catch(x => Task.reject(true));

            // THEN: the error function should be called with the new error
            result.fork(
                assertFork(cb, err => expect(err).toBe(true)),
                jestAssertNever(cb)
            );
        });

        it('Should work with functions that throws', (cb) => {
            // GIVEN: a rejected task
            const task = Task.reject('buu');

            // WHEN: we catch the error, returning a new error
            const result = task.catch(x => {throw new Error('buu'); });

            // THEN: the error function should be called with the new error
            result.fork(
                assertFork(cb, x => {expect(x).toBeInstanceOf(UncaughtError); }),
                jestAssertUntypedNeverCalled(cb)
            );
        });
    });
});
