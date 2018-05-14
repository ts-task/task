import { map } from '../../src/operators/basic';
import { share } from '../../src/operators/experimental';
import { Task, UncaughtError } from '../../src/task';
import { assertFork, jestAssertNever, jestAssertUntypedNeverCalled } from '../jest-helper';


describe('share', () => {
    it('should be lazy (dont call if not forked)', cb => {
        // GIVEN: a manually created task
        const task = new Task(resolve => {
            // This should not be called
            expect(true).toBe(false);
        });

        // WHEN: we share but we dont fork
        task.pipe(share());

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

        // WHEN: we share and fork
        task.pipe(share());

        // THEN: the content of the task is called
        task.fork(x => x, x => x);
    });

    it('Should call the constructor twice if we dont use it', (cb) => {
        // GIVEN: a manually created task that uses and modifies a global variable
        let i = 0;
        const task = new Task<number, never>(resolve => {
            resolve(i++);
        });

        // WHEN: we transform the value without using share
        const result = task.pipe(
            map(n => '' + n)
        );

        // THEN: the first time we fork we should have the value 0
        result.fork(
            jestAssertNever(cb),
            x => expect(x).toBe('0')
        );

        // THEN: and the second time, the value 1
        result.fork(
            jestAssertNever(cb),
            assertFork(cb, x => expect(x).toBe('1'))
        );
    });

    it('Should call the constructor once if we use it', (cb) => {
        // GIVEN: a manually created task that uses and modifies a global variable
        let i = 0;
        const task = new Task<number, never>(resolve => {
            resolve(i++);
        });

        // WHEN: we transform the value using share
        const result = task.pipe(
            map(n => '' + n),
            share()
        );
        // THEN: the first time we fork we should have the value 0
        result.fork(
            jestAssertNever(cb),
            x => expect(x).toBe('0')
        );

        // THEN: and the second time as well
        result.fork(
            jestAssertNever(cb),
            assertFork(cb, x => expect(x).toBe('0'))
        );
    });

    it('Should share the error', (cb) => {
        // GIVEN: a manually created task that rejects only once
        let i = 0;
        const task = new Task<number, string>((resolve, reject) => {
            if (i++ === 0) {
                reject('buu');
            } else {
                resolve(i);
            }
        });

        // WHEN: we transform the value using share
        const result = task.pipe(
            map(n => '' + n),
            share()
        );

        // THEN: both times we fork we should get the error
        result.fork(
            assertFork(cb, x => expect(x).toBe('buu')),
            jestAssertUntypedNeverCalled(cb)
        );

        result.fork(
            assertFork(cb, x => expect(x).toBe('buu')),
            jestAssertUntypedNeverCalled(cb)
        );
    });
});
