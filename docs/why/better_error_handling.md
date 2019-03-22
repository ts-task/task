# Better Error Handling
If you ever used Promises in TypeScript you may have noticed that it's only typed on success a.k.a `Promise<T>`. For example in the following code

```typescript
const somePromise: Promise<string>;

somePromise
  // Transform the eventual value
  .then(x => `${x}!!!`)
  // And then do something with it
  .then(
    value => /* value is of type string */,
    err   => /* err is of type any */
)
```

We know `value` is of the expected type `T` but we don't know **any**thing about `err`. The main reason is that when we transform our promises, the callbacks we pass to `then` can throw **any**thing and TypeScript doesn't type exceptions. We could modify the types to something like `Promise<string, Error>`, but it would be a lie. If an exception is thrown we can't know its type, it can be **any**thing, and because `any & Error = any` we can't be more specific.

Thats a boomer because we make all this trouble with static typing to have more confidence on our code and we are left wide open when something goes wrong.

> If you only type on success, you are missing half the fun.


So we can't forbid a function from throwing but we can wrap exceptions inside an `UnknownError` object, and with that decision alone we can type `Task<T, E>` and let TypeScript help us infer and manipulate errors 🎉.

```typescript
const task1 = Task.resolve(1);
// task1 is of type Task<number, never>, which makes sense as there is no way Task.resolve can fail

const task2 = task1.map(n => '' + n)
// task2 is of type Task<string, UnknownError>.
// We transform the success value but we don't have a way to know if the callback
// function throws an error or not, so we need to wrap it
```

The type inference will help you when you add, remove or transform your errors. For example we can use `caseError` from [@ts-task/utils](https://github.com/ts-task/utils) to do something like this

```typescript
import { Task } from 'ts-task/task';
import { caseError, isInstanceOf } from 'ts-task/utils';

// Assuming we have defined a getUser function somewhere
declare function getUser(id: number): Task<User, DbError | UserNotFound>;

const user = getUser(100)
  .catch(
    caseError(
      // If the error meets this condition
      isInstanceOf(UserNotFound),
      // Handle it with this callback
      err => Task.resolve(new Guest())
    )
  )
// user will have type Task<User | Guest, DbError | UnknownError> because caseError only handles
// UserNotFound (removing it from the errors) and resolves it to a new type of answer (Guest)
// and there is always the possibility that one of those functions throws, so we have to take UnknownError
// into account
```

Another use case could be to only retry an http request if the error was 502, or 504 which may happen on a timely basis but don't retry if the error was 401 or a rate limit as the expected result is the same.

Because Tasks are lazy, if you want something to happen you need to fork the task. And when you do it, the error callback comes first, so you need to explicitly say how you want to handle the error. You can always ignore it or `console.log` it, but you need to make a conscious decision.

```typescript
Task
  .resolve('Hello!')
  .fork(
      err => console.error('Buu', err), // Errors come first!
      msg => console.log('Yeay', msg)
  );
```
