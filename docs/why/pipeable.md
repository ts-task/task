# Pipe operator
When the [pipe operator](https://github.com/tc39/proposal-pipeline-operator) lands to JavaScript (currently in stage 1) we will be able to write code like this

```javascript
const task = Task.resolve(1)
    |> map(n => '' + n)
    |> chain(getUser)
    |> retryWhen(DbError)
    |> catchError(caseError(UserNotFound, err => Task.resolve(null)))
```

which has the advantage of using custom methods without having to modify the prototype of `Task`. But because we cannot
wait until the operator makes it to the standard we added a `pipe` method inspired by [RxJs pipeable operators](https://github.com/ReactiveX/rxjs/blob/master/doc/pipeable-operators.md).

So the previous code would look like:

```javascript
const task = Task.resolve(1).pipe(
      map(n => '' + n)
    , chain(getUser)
    , retryWhen(DbError)
    , catchError(caseError(UserNotFound, err => Task.resolve(null)))
)
```

which is not that different. All that's required is that the functions passed pipe to have the signature
`Task<T1, E1> => Task<T2, E2>`. You can find a common operators in the [@ts-task/utils](https://github.com/ts-task/utils) library, but we encourage you to write your own.