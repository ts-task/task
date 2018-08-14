import { Task } from './task';

declare module './task' {
    // tslint:disable-next-line:interface-name
    namespace Task {
        function all <T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, E1, E2, E3, E4, E5, E6, E7, E8, E9, E10> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>, Task<T5, E5>, Task<T6, E6>, Task<T7, E7>, Task<T8, E8>, Task<T9, E9>, Task<T10, E10>]): Task<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9 | E10>;
        function all <T1, T2, T3, T4, T5, T6, T7, T8, T9, E1, E2, E3, E4, E5, E6, E7, E8, E9> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>, Task<T5, E5>, Task<T6, E6>, Task<T7, E7>, Task<T8, E8>, Task<T9, E9>]): Task<[T1, T2, T3, T4, T5, T6, T7, T8, T9], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9>;
        function all <T1, T2, T3, T4, T5, T6, T7, T8, E1, E2, E3, E4, E5, E6, E7, E8> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>, Task<T5, E5>, Task<T6, E6>, Task<T7, E7>, Task<T8, E8>]): Task<[T1, T2, T3, T4, T5, T6, T7, T8], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8>;
        function all <T1, T2, T3, T4, T5, T6, T7, E1, E2, E3, E4, E5, E6, E7> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>, Task<T5, E5>, Task<T6, E6>, Task<T7, E7>]): Task<[T1, T2, T3, T4, T5, T6, T7], E1 | E2 | E3 | E4 | E5 | E6 | E7>;
        function all <T1, T2, T3, T4, T5, T6, E1, E2, E3, E4, E5, E6> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>, Task<T5, E5>, Task<T6, E6>]): Task<[T1, T2, T3, T4, T5, T6], E1 | E2 | E3 | E4 | E5 | E6>;
        function all <T1, T2, T3, T4, T5, E1, E2, E3, E4, E5> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>, Task<T5, E5>]): Task<[T1, T2, T3, T4, T5], E1 | E2 | E3 | E4 | E5>;
        function all <T1, T2, T3, T4, E1, E2, E3, E4> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>, Task<T4, E4>]): Task<[T1, T2, T3, T4], E1 | E2 | E3 | E4>;
        function all <T1, T2, T3, E1, E2, E3> (tasks: [Task<T1, E1>, Task<T2, E2>, Task<T3, E3>]): Task<[T1, T2, T3], E1 | E2 | E3>;
        function all <T1, T2, E1, E2> (tasks: [Task<T1, E1>, Task<T2, E2>]): Task<[T1, T2], E1 | E2>;
        function all <T, E> (tasks: Array<Task<T, E>>): Task<[T], E>;
    }
}

Task.all = function (tasks: any): any {
    // Flag to track if any Task has resolved
    let rejected = false;
    // Array that we'll fill with the resolved values, in order
    const resolvedValues: any[] = [];
    // Counter of resolved Tasks (we can't use resolvedValues.length since we add elements through index)
    let resolvedQty = 0;

    return new Task((outerResolve, outerReject) => {
        tasks.forEach((aTask: any, index: number) => {
            aTask
                .fork((err: any) => {
                    // We do only reject if there was no previous rejection
                    if (!rejected) {
                        rejected = true;
                        outerReject(err);
                    }
                }, (x: any) => {
                    // Shouldn't resolve if another Task has rejected
                    if (rejected) {
                        return;
                    }

                    // Track resolved value (in order)
                    resolvedValues[index] = x;
                    // ...and how many tasks has resolved
                    resolvedQty++;
                    if (resolvedQty === tasks.length) {
                        outerResolve(resolvedValues);
                    }
                });
        });
    });
};