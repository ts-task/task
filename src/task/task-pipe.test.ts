import { assertFork, jestAssertNever, jestAssertUntypedNeverCalled } from '../../test/jest-helper';
import { catchError, chain, map } from '../operators';
import { Task } from './index';
import { UnknownError } from './unknown-error';

describe('Task', () => {
    describe('pipe', () => {
        it('Should return the same task if no function is passed', (cb) => {
            // GIVEN: a resolved value
            const task = Task.resolve(0);

            // WHEN: we call pipe with no transformation
            const result = task.pipe();

            // THEN: the success function should be called without transformation
            result.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe(0))
            );
        });

        it('Should work with one function', (cb) => {
            // GIVEN: a resolved value
            const task = Task.resolve(0);

            // WHEN: we pipe the value
            const result = task.pipe(
                map(n => '' + n)
            );

            // THEN: the success function should be called with the transformed value
            result.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe('0'))
            );
        });

        it('Should work with multiple functions', (cb) => {
            // GIVEN: a resolved value
            const task = Task.resolve(0);

            // WHEN: we pipe the value
            const result = task.pipe(
                map(n => '' + n),
                map(s => s + '!'),
                map(s => s + '!'),
                map(s => s + '!')
            );

            // THEN: the success function should be called with the transformed value
            result.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe('0!!!'))
            );
        });

        it('Should work with multiple functions converting success types correctly', (cb) => {
            // GIVEN: a resolved value
            const task = Task.resolve(0);

            // WHEN: we pipe the value
            const result = task.pipe(
                map(n => '' + n),
                map(s => parseInt(s)),
                map(n => '' + n),
                map(s => parseInt(s))
            );

            // THEN: the success function should be called with the transformed value
            result.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe(0))
            );
        });
        it('Should be lazy (dont call if not forked)', (cb) => {
            // GIVEN: a resolved value
            const task = Task.resolve(0);

            // and a manually created pipeable function
            const dontCall = (t: Task<number, never>) => {
                // This should not be called
                expect(true).toBe(false);
                return t;
            };

            // WHEN: we pipe the value but dont fork
            const result = task.pipe(
                dontCall
            );

            // THEN: the content of the task is never called
            setTimeout(cb, 20);
        });

        it('Should handle pipeable methods that throw', (cb) => {
            // GIVEN: a resolved value
            const task = Task.resolve(0);

            // and a manually created pipeable function
            const pipeThatThrows = (t: Task<number, never>): Task<number, never> => {
                throw 'oops';
            };

            // WHEN: we pipe the value
            const result = task.pipe(
                pipeThatThrows
            );

             // THEN: the error function should be called with the new error
             result.fork(
                assertFork(cb, x => {expect(x).toBeInstanceOf(UnknownError); }),
                jestAssertUntypedNeverCalled(cb)
            );
        });

        it('Should be able to recover from pipeable methods that throw', (cb) => {
            // GIVEN: a resolved value
            const task = Task.resolve(0);
            const task2 = Task.resolve('0');
            // and a manually created pipeable function
            const pipeThatThrows = (t: Task<number, never>): Task<number, never> => {
                throw 'oops';
            };

            // WHEN: we pipe the value
            const result = task.pipe(
                pipeThatThrows,
                catchError(err => task2)
            );

            // THEN: the success function should be called with the catched value
            result.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe('0'))
            );
        });

        it('Should be able to propagate errors correctly', (cb) => {
            // GIVEN: a resolved value
            const task = Task.resolve(0);
            const rej = Task.reject('buu');
            const task2 = Task.resolve('0');

            // WHEN: we pipe the value
            const result = task.pipe(
                chain(val => rej),
                // err should be of type `string | UncauchtError`
                // The first because of rej, the second one because of chain
                catchError(err => task2)
            );

            // THEN: the success function should be called with the catched value
            result.fork(
                jestAssertNever(cb),
                assertFork(cb, x => expect(x).toBe('0'))
            );
        });
    });
});
