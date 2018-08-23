import { Task } from '@acamica/task';

// Resolve and reject can infere one of the generics from the passed
// argument, but the other one is defaulted to never and if necesary
// it must be passed manually.

// The problem normally arises when we find something like this
function foo(condition: boolean) {
    if (condition) {
        return Task.resolve(9);
    } else {
        return Task.reject('buu');
    }
}

// This get's interpreted as
foo; // $ExpectType (condition: boolean) => Task<number, never> | Task<never, string>
// which it's probably not what we wanted.

// The problem is that TypeScript can't do the OR distribution for us, we
// need to provide the same type to each branch of the IF.

// To make both Tasks match we need to specify the types when we create it
Task.resolve<number, string>(9);    // $ExpectType Task<number, string>
Task.reject<string, number>('buu'); // $ExpectType Task<number, string>

// Notice that in both cases we pass first the infered type and then the missing
// one, so it can become a little verbose. If we did it the other way around
// TypeScript could interpret things badly when only passing one type argument.
//
// Once Named Type Arguments lands in version 3.1 we could define it like this
//
//      Task.resolve<E = string>(9)
//      Task.reject<T = number>('buu')
//
// but that would set the required TypeScript version too high
// so will probably add it once it's been available for a while
// PR: https://github.com/Microsoft/TypeScript/pull/23696

// This would allow us to write our previous example like
function foo2(condition: boolean) {
    if (condition) {
        return Task.resolve<number, string>(9);
    } else {
        return Task.reject<string, number>('buu');
    }
}
// And have the type as expected
foo2; // $ExpectType (condition: boolean) => Task<number, string>

// This also happens if we are using the ternary operator
const bar = (condition: boolean) => condition ? Task.resolve(9) : Task.reject('buu');
bar; // $ExpectType (condition: boolean) => Task<number, never> | Task<never, string>

const bar2 = (condition: boolean) =>
    condition
        ? Task.resolve<number, string>(9)
        : Task.reject<string, number>('buu');

bar2; // $ExpectType (condition: boolean) => Task<number, string>
