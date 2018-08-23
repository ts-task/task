import { Task } from '@acamica/task';

// Given three basic tasks
const t1 = Task.resolve(9);                     // $ExpectType Task<number, never>
const t2 = Task.resolve<string, string>('foo'); // $ExpectType Task<string, string>
const t3 = Task.resolve<boolean, Error>(true);  // $ExpectType Task<boolean, Error>

// Task.all will infer the success type T as a tuple of its arguments' success values,
// and the error type E as any of the individual errors
Task.all([t1, t2, t3]); // $ExpectType Task<[number, string, boolean], string | Error>

// TODO: Document this error.
// const allT = [t1, t2, t3];

// Task.all(allT);