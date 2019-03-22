[![Npm version](https://img.shields.io/npm/v/@ts-task/task.svg)](https://www.npmjs.com/package/@ts-task/task)
[![Build Status](https://travis-ci.com/ts-task/task.svg?branch=master)](https://travis-ci.com/ts-task/task)
[![Coverage Status](https://coveralls.io/repos/github/ts-task/task/badge.svg?branch=master)](https://coveralls.io/github/ts-task/task?branch=master)
![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@ts-task/task.svg)

# Task

It's like a Promise but lazy, extensible and with improved error handling.

> made (and best used) with [TypeScript](http://www.typescriptlang.org/) ♥️

### Usage
**Install** the library in your project.
```bash
npm install @ts-task/task
```

**Use** it like a Promise (with some differences)

```typescript
import { Task } from '@ts-task/task';

// Creates a task that resolves in 2 seconds
const task1 = new Task((resolve, reject) => {
    setTimeout(
        _ => resolve('Hello'),
        2000
    )
})

// Immediately resolved task
const task2 = Task.resolve('world');

// Wait for both task to complete
Task.all([task1, task2])
    // Transform the eventual values
    .map(([msg1, msg2]) => `${msg1} ${msg2}!!!`)
    // Actually do something with the data
    .fork(
        // Errors come first and they are typed!
        err => console.error('Buu', err),
        msg => console.log('Yeay', msg)
    );
```

**Learn more** by reading the [basic usage](/test/types/basic-usage.ts) file, the [API docs](/docs/api.md) or one of the links from the next section. If you prefer to watch videos, [introducing task](https://www.youtube.com/watch?v=T7O1T1wmw00) explains why the library was created and shows a real world example. If you understand spanish you can watch the talk [whose error is it anyway](https://www.youtube.com/watch?v=WIf582XYm-w).

### But why

Promises are great! so why do we need a replacement?

Good question, I'm happy you asked:

* Task have [better error handling](/docs/why/better_error_handling.md), so you'll have less bugs.
* Task are [`pipe`able](/docs/why/pipeable.md), so they are easier to extend.
* Task methos have [specific semantics](/docs/why/semantics.md), so it' easier to know what you are doing.
* Task are Lazy, so it's easier to create retry logic.


## Related projects

* [@ts-task/utils](https://github.com/ts-task/utils): Utility functions to use with task.
* [@ts-task/fs](https://github.com/ts-task/fs): Wrapper around the node File System
* [@ts-task/fetch](https://github.com/ts-task/fetch): Wrapper around window fetch, works with node as well.


If you have created a library that uses task and you want to share it,  please fill an issue.

## Credits

Initialized with [@alexjoverm](https://twitter.com/alexjoverm)'s [TypeScript Library Starter](https://github.com/alexjoverm/typescript-library-starter) under the Acamica Labs initiative and made with :heart: by

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars0.githubusercontent.com/u/2634059?v=4" width="100px;"/><br /><sub><b>Hernan Rajchert</b></sub>](https://github.com/hrajchert)<br />[💻](https://github.com/hrajchert/@ts-task/task/commits?author=hrajchert "Code") [🎨](#design-hrajchert "Design") [📖](https://github.com/hrajchert/@ts-task/task/commits?author=hrajchert "Documentation") [💡](#example-hrajchert "Examples") [⚠️](https://github.com/hrajchert/@ts-task/task/commits?author=hrajchert "Tests") | [<img src="https://avatars1.githubusercontent.com/u/1573956?v=4" width="100px;"/><br /><sub><b>Gonzalo Gluzman</b></sub>](https://github.com/dggluz)<br />[💻](https://github.com/hrajchert/@ts-task/task/commits?author=dggluz "Code") [🤔](#ideas-dggluz "Ideas, Planning, & Feedback") [⚠️](https://github.com/hrajchert/@ts-task/task/commits?author=dggluz "Tests") |
| :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
