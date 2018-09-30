import { assertFork, jestAssertNever, jestAssertUntypedNeverCalled } from '../../test/jest-helper';
import { Task } from './index';

describe('Task', () => {
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

        it('should mantain types when given an array of elements of the same type', cb => {
            // GIVEN: a resolved Task
            const task = Task.resolve(5);

            const multipleTasks = [task, task, task, task, task, task, task, task, task, task, task];

            // WHEN: we do a Task.all from the previous tasks
            const tAll = Task.all(multipleTasks);


            // THEN: the resulting Task is resolved with an array of the resolved value
            tAll.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toEqual([5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]))
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

        it('should resolve to an empty array if it\'s called with an empty array', cb => {
            // GIVEN: an empty array
            const arr: Task<number, never>[] = [];

            // WHEN: calling `Task.all` with that array
            const tAll = Task.all(arr);

            // THEN: the resulted Task is resolved with an empty array.
            tAll.fork(
                jestAssertNever(cb),
                assertFork(cb, result => {
                    expect(result).toEqual([]);
                })
            );
        });
    });
});
