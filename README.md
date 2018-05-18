# Task
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#credits)
[![Build Status](https://travis-ci.org/acamica/task.svg?branch=master)](https://travis-ci.org/acamica/task)

Like a Promise with better error handling and some other upgrades.

> made (and best used) with [TypeScript](http://www.typescriptlang.org/) ♥️

### Usage
**Install** the library in your project.
```bash
npm install @acamica/task
```

**Use** it in your code preeeeety much how you would use a Promise.

```javascript
// Create it with a resolver that may resolve in the future
const task1 = new Task((resolve, reject) => {
    setTimeout(
        _ => resolve('Hello in 2s'),
        2000
    )
})

// Or you can create it with a constructor
const task2 = Task.resolve(1);

// Or even from a promise
const task3 = Task.fromPromise(fetch('http://my-api'))

// Once you have the task manipulate it at will
task1
    // Transform the eventual value (like Promise.then or Array.map)
    .map(msg => `${msg}!!!`)
    // Make a new async computation after we get the first value (like Promise.then or Array.flatMap)
    .chain(msg => Task.fromPromise(fetch(msg)))
    // Do something with the value once you have it
    .fork(
        err => console.error('Buu', err), // Errors are first class Yeay!
        msg => console.log('Yeay', msg)
    );
```

### Why

Promises are great! so why do we need a replacement? or when should I use `Task`?

Good question, I'm happy you asked. Both promises and tasks are great if you are working with *single asynchronous values*, meaning **one** *value or event* that maybe ocurring now or in some future. For example getting results from a database query, or making an AJAX request to a server. If you need *multiple asynchronous values* you should check out [RxJs](https://github.com/ReactiveX/RxJS).

The differences between Task and Promise (or why should you choose task) are:

* Task have [errors as first citizen](#errors-as-first-citizen)
* Task are [`pipe`able](#pipe-operator) so they are easier to extend
* Task has better semantics
* Task are Lazy, so it's easier to create retry logic
* Soon they will be cancellable ([before version 1.0.0](#before-version-1))

### Errors as first citizen
If you ever used Promises in TypeScript you may have noticed that it's only typed on success a.k.a `Promise<T>`. For example in the following code

```javascript
let somePromise: Promise<boolean>;

somePromise.then(
    value => /* value is of type boolean */,
    err   => /* err is of type any */
)
```

We know `value` is of the expected type `T` but we don't know anything about `err`, so it's type is `any`. The main problem that doesn't allow us to have a proper `Promise<T, E>` is that a function inside the `then` method can throw anything, and in TypeScript the exceptions are not typed, so we don't have a way to specify `E` and we cannot forbid the function from throwing, hence `any`.

With Task, we cannot forbid a function from throwing but we can wrap the error inside an `UncaughtError` object, and with that decision alone we can proper infer and manipulate errors 🎉.

So for example

```javascript
const task1 = Task.resolve(1);
// task1 is of type Task<number, never>, which makes sense as there is no way resolve can fail

const task2 = task1.map(n => '' + n)
// task2 is of type Task<string, UncaughtError>, because we have to expect that the inner
// function may throw

// assuming we have
// function getUser(id: string): Task<User, DbError | UserNotFound>

const task3 = task2.chain(getUser)
// task3 is of type Task<User, DbError | UserNotFound | UncaughtError>.
// Here the UncaughtError is here because it was from the task before and also
// because we don't know if the chain function throws.
```

And having the error typed is great for defensive programming 🛡 because it allows you to gain confidence on how you are
handling your errors. You can also add, remove and transform your error logic. For example if you use the experimental
`caseError` operator you could do something like this

```javascript
const task4 = task3.catch(caseError(UserNotFound, err => Task.resolve(null)))
// task4 will have type Task<User | null, DbError | UncaughtError> because caseError only handles
// the UserNotFound error (removing it from the errors) and resolves it to a new type of answer (null)
```

This will allow you to do things like only retry an http request if the error was 502, or 504 which may happen on a timely basis but don't retry if the error was 401 or a rate limit error which shouldn't be retried as the expected result is the same


In conclusion, like somebody once said (it was me)

> If you only type on success you're missing half the fun

### Pipe operator
When the [pipe operator](https://github.com/tc39/proposal-pipeline-operator) lands to JavaScript (currently in stage 1) we will be able to write code like this

```javascript
const task = Task.resolve(1)
    |> map(n => '' + n)
    |> chain(getUser)
    |> retryWhen(DbError)
    |> catchError(caseError(UserNotFound, err => Task.resolve(null)))
```

which has the advantage of using custom methods without having to modify the prototype of `Task`. But because we cannot
wait until the operator makes it to the standard we added a `pipe` method to Task, inspired by RxJs.

So the previous code would look like

```javascript
const task = Task.resolve(1).pipe(
      map(n => '' + n)
    , chain(getUser)
    , retryWhen(DbError)
    , catchError(caseError(UserNotFound, err => Task.resolve(null)))
)
```
which is not that bad. All that is required is that the functions passed pipe to have the following signature
`Task<T1, E1> => Task<T2, E2>`

We have a list of experimental operators in `src/operators/experimental.ts`. Use them with discresion as they might change without notice. All other operators will follow the semantic release convension.

### Better semantics

TODO: Explain the difference between promises `then` method and task `map`, `chain`, `fork`

### Before version 1

* Make task cancellable with semantics similar to RxJs
* Improve UncaughtError
* Probably shouldn't use Promise internally

## Credits

Initialized with [@alexjoverm](https://twitter.com/alexjoverm)'s [TypeScript Library Starter](https://github.com/alexjoverm/typescript-library-starter), and made with :heart: by

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars0.githubusercontent.com/u/2634059?v=4" width="100px;"/><br /><sub><b>Hernan Rajchert</b></sub>](https://github.com/hrajchert)<br />[💻](https://github.com/hrajchert/@acamica/task/commits?author=hrajchert "Code") [🎨](#design-hrajchert "Design") [📖](https://github.com/hrajchert/@acamica/task/commits?author=hrajchert "Documentation") [💡](#example-hrajchert "Examples") [⚠️](https://github.com/hrajchert/@acamica/task/commits?author=hrajchert "Tests") | [<img src="https://avatars1.githubusercontent.com/u/1573956?v=4" width="100px;"/><br /><sub><b>Gonzalo Gluzman</b></sub>](https://github.com/dggluz)<br />[💻](https://github.com/hrajchert/@acamica/task/commits?author=dggluz "Code") [🤔](#ideas-dggluz "Ideas, Planning, & Feedback") [⚠️](https://github.com/hrajchert/@acamica/task/commits?author=dggluz "Tests") |
| :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!