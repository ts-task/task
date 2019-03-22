# Specific semantics

Promises API is quite simple by design, it has a `then` method that can be used for 3 different purposes, in contrast *Task* has a different method for each usage.

* `Promise.then` can be used to **transform** an eventual value, with *task* you should use `map`.
* `Promise.then` can be used to **chain** sequential async operations, with *task* you should use `chain`.
* `Promise.then` can be used to **do** something once you have the result, with *task* you should use `fork`.

As stated in *Lord of the Promises*
> One `method` to rule them all, One `method` to find them,
> One `method` to bring them all and in the darkness **bind** them

The nice thing about having one method should be simplicity (less methods to remember), but trying to put the different use cases in the same method can cause some confusions that we'll explain in this section.

When we want to **do** something with an eventual value, we need to know if the Promise *succeeds* or *fails*. Thats why `then` accepts two arguments, the *onSuccess* and *onError* callbacks (in that order).

If it's used in the middle of a Promise chain, it can cause some confusion

```javascript
// It's not recommended to do this
somePromise
  .then(x => foo(x))
  .then(
      y   => bar(y),
      err => handleError(err)
    )
  .then(z => baz(z))
```

a common doubt arises with `handleError`, does it catch errors on *foo* or also in *bar*?. The answer is the first option, but because it can seem ambigous it is recomended to write an explicit `catch` instead.

```javascript
// Instead do this
somePromise
  .then(x => foo(x))
  .catch(err => handleError(err))
  .then(y => bar(y))
  .then(z => baz(z))
```


The second argument of `then` should only be used in the last step of a Promise chain, when we are **do**ing something with the result.

```javascript
somePromise
  .then(...)
  .then(...)
  .then(
    html => render(html),
    err => openErrorModal(err)
  );
```

But because the second parameter is optional, it's fairly easy to end up with fragile code. For example:

```javascript
somePromise
  .then(...)
  .then(...)
  .then(
    html => render(html)
  );
```

if `somePromise` fails there is no handler, depending on the environment you could get a silent error or an `Uncaught Promise Rejection` that may be difficult to trace.

When using task, if you want to **do** something with your eventual result you have to use `fork` as the last step. That method is the only one that doesn't return a new *task*, so it's impossible to use it in the middle of the chain. Even more, `fork` handles errors in the first callback, so it's impossible to have an `Uncaught Promise Rejection`.

```typescript
someTask
  .map(...)
  .chain(...)
  .fork(
      err => openErrorModal(err),
      html => render(html)
  )
```

And because *Tasks* are lazy, if you don't call `fork` nothing happens, so the library forces you to use best practices.

The difference between `map` and `chain` is a little more subtle. Promise (and Tasks) **transform**ations are useful when you don't care about the eventual value itself, rather something that can be synchronously computed from that value. For example, you could fetch a document and only care about how many words the document has.

```typescript
import { fetch as fetchTask } from '@ts-task/fetch';

fetch('http://task-manifesto.org')
  .then(doc => countWords(doc))
  .then(n => alert(`The document has ${n} words`));

fetchTask('http://task-manifesto.org')
  .map(doc => countWords(doc))
  .fork(
    noop,
    n => alert(`The document has ${n} words`)
  );
```

where we assume `countWords` is a function that receives a `String` and returns a `Number`.

In contrast, **chain**ing *Promises* and *Tasks* are useful when you need the result of a previous async operation in order to make the next one. For example the first request may return a JSON object with an url to make the next request.

```typescript
import { fetch as fetchTask } from '@ts-task/fetch';

fetch('http://some-rest.api')
  .then(res => analyzeResponseAndGetTheUrl(res))
  .then(url => fetch(url));
  .then(obj => alert(`Some data ${obj.foo}`));

fetchTask('http://some-rest.api')
  .map(res => analyzeResponseAndGetTheUrl(res))
  .chain(url => fetchTask(url));
  .fork(
    noop,
    obj => alert(`Some data ${obj.foo}`)
  );

```

In this example we are synchronously **transform**ing the first response using the `analyzeResponseAndGetTheUrl` function that receives an `Object` and returns a `String` and then **chain**ing the eventual transformation with the second call to `fetch`.

This should give you an intuition that whenever you see a `map` you are not adding more time to your computation, but when you are using `chain` you are most likely are.

