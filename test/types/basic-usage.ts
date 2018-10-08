import { Task, UnknownError } from '@ts-task/task';
// Task is parameterized in success (T) and error (E)

// When you create one using Task.resolve or Task.reject TypeScript
// will infer the type from the passed argument.

Task.resolve(8);    // $ExpectType Task<number, never>
Task.reject('Buu'); // $ExpectType Task<never, string>

// by default Task.resolve can't fail and Task.reject can't provide
// a value so we use never to describe that.

// Notice that if you create a Task using a Resolver the type can't
// be infered
const r1 = new Task((resolve, reject) => {
    resolve(1);
});
r1; // $ExpectType Task<{}, {}>

// So if you need to do it, make sure to pass the types manually
const r2 = new Task<number, string>((resolve, reject) => {
    resolve(1);
});
r2; // $ExpectType Task<number, string>

// when we transform a Task, we can't be sure if the callback
// we provide throws or not because at this moment TypeScript
// doesn't have typed exceptions.
// That's why we decided to catch all functions and return an
// UnknownError if a function throws
const t1 = Task
    .resolve(9)
    .map(x => x + 1);
t1; // $ExpectType Task<number, UnknownError>

// If you want to add a specific error type, you can return a
// rejected task in the chain operator
const t2 = Task
    .resolve(9)
    .map(x => x + 1)
    .chain(x =>
        x % 2
        ? Task.reject('I dont like pair numbers')
        : Task.resolve(x)
    );
t2; // $ExpectType Task<number, string | UnknownError>

// You may want to use something more manageable than a string,
// that gives some context to the error and it's easier to distinguish

// You can catch specific errors.
// Notice that the error goes away from the types
const t3 = Task
    .resolve<number, Error | string | UnknownError>(9)
    .catch(err =>
        // Only handle string errors
        typeof err === 'string'
        ? Task.resolve(-1)
        : Task.reject(err)
);
t3; // $ExpectType Task<number, UnknownError | Error>

// Task forces you to check for errors, so when you fork the
// first callback is the error and the second callback is the success.
// You can always ignore it, but you'll have to do it consciously.
Task.resolve(1).fork(
    err => void 0, // $ExpectType (err: never) => undefined
    val => void 0 // $ExpectType (val: number) => undefined
);
