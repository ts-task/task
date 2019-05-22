import { assertFork, jestAssertNever, jestAssertUntypedNeverCalled } from '../../test/jest-helper';
import { Task } from './index';

describe('Task', () => {
    describe('fork', () => {
        it('should be lazy (dont call if not forked)', cb => {
            // GIVEN: a manually created task
            const task = new Task(resolve => {
                // This should not be called
                expect(true).toBe(false);
            });

            // WHEN: we dont fork
            // THEN: the content of the task is never called
            setTimeout(cb, 20);
        });

        it('should be lazy (called when forked)', cb => {
            // GIVEN: a manually created task
            const task = new Task(resolve => {
                // This should be called
                expect(true).toBe(true);
                cb();
            });

            // WHEN: we fork
            // THEN: the content of the task is called
            task.fork(x => x, x => x);
        });

        it('Should be asynchronous', cb => {
            // GIVEN: A task that resolves in the future
            const task = new Task<string, never>(resolve =>
                setTimeout(_ => resolve('wii'), 10)
            );

            // WHEN: we fork, THEN: it should call the success function in ten ms
            task.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe('wii'))
            );
        });

        it('Should call success handler on success', cb => {
            // GIVEN: A resolved task
            const task = Task.resolve(0);

            // WHEN: we fork
            // THEN: should call its success function with the resolved value
            task.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe(0))
            );
        });

        it('Should call error handler on rejection', cb => {
            // GIVEN: A rejected task
            const task = Task.reject('buu');

            // WHEN: we fork
            // THEN: should call the error handler with the error when it fails
            task.fork(
                assertFork(cb, x => expect(x).toBe('buu')),
                jestAssertNever(cb)
            );
        });
    });
    describe('then', () => {
        // TODO: copy pasted from fork, but I probably should use
        // spies instead of relying on `cb`
        it('should be lazy', cb => {
            // GIVEN: a manually created task
            const task = new Task(resolve => {
                // This should be called
                expect(true).toBe(true);
                cb();
            });

            // WHEN: we fork
            // THEN: the content of the task is called
            task.then(x => x, x => x);
        });

        it('Should call success handler on success', cb => {
            // GIVEN: A resolved task
            const task = Task.resolve(0);

            // WHEN: we fork using then
            // THEN: should call its success function with the resolved value
            task.then(
                assertFork(cb, x => expect(x).toBe(0)),
                jestAssertNever(cb)
            );
        });

        it('Should call error handler on rejection', cb => {
            // GIVEN: A rejected task
            const task = Task.reject('buu');

            // WHEN: we fork using then
            // THEN: should call the error handler with the error when it fails
            task.then(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe('buu'))
            );
        });

        it('Should be awaitable', async () => {
            // GIVEN: A resolved task
            const task = Task.resolve(0);

            // WHEN: we await on it
            const val = await task;

            // THEN: It shoud yield the value
            expect(val).toEqual(0);
        });

        it('Should be asynchronous', async () => {
            // GIVEN: A task that resolves in the future
            const task = new Task<string, never>(resolve =>
                setTimeout(_ => resolve('wii'), 10)
            );

            // WHEN: we await on it
            const val = await task;

            // THEN: it should yield the value in 10ms
            expect(val).toEqual('wii');
        });
    });
});
