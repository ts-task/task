import { Task } from '@acamica/task';

// By default fromPromise can infer the value T from the promise, and the error
// is anything (that's why we are using this library, to have typed errors)
Task.fromPromise(Promise.resolve(9)); // $ExpectType Task<number, any>

// If you like, you can always specify the error type if you know it
Task.fromPromise<number, never>(Promise.resolve(9)); // $ExpectType Task<number, never>