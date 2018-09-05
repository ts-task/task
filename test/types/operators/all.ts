import { Task } from '@ts-task/task';

/************************************************
 * Tasks with an unary tuple
 ***********************************************/

// Given a basic Task
const t = Task.resolve(9); // $ExpectType Task<number, never>

// ...Task.all called with an unary tuple of that Task will give us a Task of an
// unary tuple with the result
Task.all([t]); // $ExpectType Task<[number], never>

/************************************************
 * Tasks with a n-ary tuple
 ***********************************************/

// Given three basic tasks
const t1 = Task.resolve(9);                     // $ExpectType Task<number, never>
const t2 = Task.resolve<string, string>('foo'); // $ExpectType Task<string, string>
const t3 = Task.resolve<boolean, Error>(true);  // $ExpectType Task<boolean, Error>

// ...Task.all will infer the success type T as a tuple of its arguments' success values,
// and the error type E as any of the individual errors
Task.all([t1, t2, t3]); // $ExpectType Task<[number, string, boolean], string | Error>

// TODO: Document this error.
// const allT = [t1, t2, t3];

// Task.all(allT);

/************************************************
 * Tasks with an array (not tuple)
 ***********************************************/

// Given an array of tasks:
const arrOfTasks = [1, 2, 3] // $ExpectType Task<number, never>[]
	.map(x =>
		Task.resolve(x)
	)
;

// ...Task.all called with that array will give as a Task of an array:
Task.all(arrOfTasks); // $ExpectType Task<number[], never>
