import { Task, UncaughtError } from '../src/task';
import { assertFork, jestAssertNever, jestAssertUntypedNeverCalled } from './jest-helper';



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

    describe('map', () => {
        it('Should handle transformation functions', (cb) => {
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

    describe('all', () => {
        it('should work with a single resolved Task', cb => {
            // GIVEN: a resolved Task
            const task = Task.resolve(5);

            // WHEN: we do a Task.all from the previous one Task
            const tAll = Task.all([task]);

            // THEN: the resulting Task is resolved with an array of the resolved value
            tAll.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toEqual([5]))
            );
        });

        it('should work with a single rejected Task', cb => {
            // GIVEN: a rejected Task
            const task = Task.reject('Buu!');

            // WHEN: we do a Task.all from the previous one Task
            const tAll = Task.all([task]);

            // THEN: the resulting Task is rejected with the rejected error
            tAll.fork(
                assertFork(cb, err => expect(err).toEqual('Buu!')),
                jestAssertUntypedNeverCalled(cb)
            );
        });

        it('should resolve if all task are resolved', cb => {
            // GIVEN: a bunch of resolved Tasks
            const task1 = Task.resolve(10);
            const task2 = Task.resolve('100');
            const task3 = Task.resolve(true);

            // WHEN: we do a Task.all from the previous Tasks
            const tAll = Task.all([task1, task2, task3]);

            // THEN: the resulting Task is resolved with the resolved values
            tAll.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toEqual([10, '100', true]))
            );
        });

        it('should wait async tasks', cb => {
            // GIVEN: a bunch of resolved Tasks
            const task1 = Task.resolve(10);
            const task2 = new Task<string, never>(resolve => setTimeout(_ => resolve('foo'), 10));
            const task3 = Task.resolve(true);

            // WHEN: we do a Task.all from the previous Tasks
            const tAll = Task.all([task1, task2, task3]);

            // THEN: the resulting Task is resolved with the resolved values
            tAll.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toEqual([10, 'foo', true]))
            );
        });

        it('should reject if there is even one rejected one', cb => {
            // GIVEN: a rejected Task
            const task1 = Task.resolve(10);
            const task2 = Task.reject('Buu!');
            const task3 = Task.resolve(1000);

            // WHEN: we do a Task.all from the previous one Task
            const tAll = Task.all([task1, task2, task3]);

            // THEN: the resulting Task is rejected with the rejected error
            tAll.fork(
                assertFork(cb, err => expect(err).toEqual('Buu!')),
                jestAssertUntypedNeverCalled(cb)
            );
        });

        it('should reject with the first rejection', cb => {
            // GIVEN: three rejected Task
            const task1 = Task.reject('Foo');
            const task2 = new Task<never, number>((_, reject) => setTimeout(_ => reject(9), 0));
            const task3 = new Task<never, boolean>((_, reject) => setTimeout(_ => reject(true), 0));

            // WHEN: we do a Task.all from the previous one Task
            const tAll = Task.all([task1, task2, task3]);

            // THEN: the resulting Task is rejected with the first rejected error
            tAll.fork(
                err => {
                    expect(err).toEqual('Foo');
                    // Need to wait to make sure we test all lines in coverage
                    setTimeout(cb, 10);
                },
                jestAssertUntypedNeverCalled(cb)
            );
        });
    });
});
