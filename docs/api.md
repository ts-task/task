# API

## Constructors
### `Task.resolve`

`Task.resolve<T, E = never>(value: T)`

This function creates an inmediatly resolved task. By default TypeScript will infer the value type and set the error type to never, as `Task.resolve` cannot fail. You can manually specify both types using angle brackets, for example this file ([test/types/parametrize-reject-and-resolve.ts](/test/types/parametrize-reject-and-resolve.ts)) shows a situation where you need to specify the types in order to unify two expressions.

```typescript
import { Task } from '@ts-task/task';

const task1 = Task.resolve(1); // Task<number, never>
const task2 = Task.resolve<number, string>(2); // Task<number, string>
```

### `Task.reject`

`Task.reject<E, T = never>(reason: E)`

This function creates a inmediatly rejected task. Similar to the resolve constructor, this function correctly infers the error type and sets the value type to never.

```typescript
import { Task } from '@ts-task/task';

const err1 = Task.reject('Something went wrong'); // Task<never, string>
```
### `new Task`

`new Task<T, E>((resolve, reject) => any)`

This is the class constructor, all other constructors are created from this function. Similar to `new Promise` you have to provide a resolver function that either `resolve` or `reject` the task. TypeScript can't infer the types from the resolver usage, so we normally need to provide the types explicitly.

```typescript
const task1 = new Task<number, never>((resolve, reject) => {
    setTimeout(
        _ => resolve(1),
        2000
    )
}); // Task<number, never>
```

### `Task.all`
`Task.all(Array<tasks<T', E'>>)`

```typescript
import { Task } from '@ts-task/task';

declare const task1: Task<number, string>;
declare const task2: Task<string, Error>;
declare const task3: Task<boolean, TypeError>;

Task.all([task1, task2, task3]); // Task<[number, string, boolean], string | Error | TypeError>
```


### `Task.fromPromise`

## Instance methods
you can watch XX to see why there are three different methods instead of just using then.

### `map`
### `chain`
### `catch`
### `fork`
### `pipe`
