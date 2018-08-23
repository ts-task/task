import { Task } from '@ts-task/task';
// Task is parameterized in success (T) and error (E)
// Task<T, E>

// When you create a Task using resolve or reject TypeScript
// will infer the type from the passed argument
Task.resolve(9);    // $ExpectType Task<number, never>
Task.reject('Buu'); // $ExpectType Task<never, string>
// by default a Task.resolve cannot fail and Task.reject can't provide
// a value so we use never to describe that.

// Task has error's as first citizens, so when we fork, the error callback
// comes first and then comes the success. This will make you be councious
// of what you do when things go south, you can always ignore it, but you'll
// know you are ignoring it.
Task.resolve(1).fork(
    err => void 0, // $ExpectType (err: never) => undefined
    val => void 0 // $ExpectType (val: number) => undefined
);

// when we transform a Task, we can't be sure if the callback
// we provide throws or not because at this moment TypeScript
// doesn't have typed exceptions.
// That's why we decided to catch all functions and return an
// UncaughtError if a function throws
const t1 = Task.resolve(9)
    .map(x => x + 1);
t1; // $ExpectType Task<number, UncaughtError>

// If you want to add a specific error type, you can do it
// by returning a rejected task in the chain operator
const t2 = Task.resolve(9)
    .map(x => x + 1)
    .chain(x =>
        x % 2
        ? Task.reject('Divisible by 2')
        : Task.resolve(x)
    );
t2; // $ExpectType Task<number, string | UncaughtError>

// You can catch particular errors, notice that the error
// goes away from the types
const t3 = t2.catch(err =>
    typeof err === 'string'
    ? Task.resolve(-1)
    : Task.reject(err)
);
t3; // $ExpectType Task<number, UncaughtError>

// Notice that if you create a Task using a Resolver the type can't
// be infered
const r1 = new Task((resolve, reject) => {
    resolve(1);
});
r1; // $ExpectType Task<{}, {}>

// So if you create it like this, make sure to pass the types manually
const r2 = new Task<number, string>((resolve, reject) => {
    resolve(1);
});
r2; // $ExpectType Task<number, string>
