import { Task, operators } from '@ts-task/task';

const { map, chain } = operators;

const t1 = Task.resolve(9); // $ExpectType Task<number, never>

const p1 = t1.pipe(
    map(x => '' + x)
);

p1; // $ExpectType Task<string, UnknownError>

const p2 = t1.pipe(
    chain(_ => Task.reject('buu'))
);
p2; // $ExpectType Task<never, string | UnknownError>
