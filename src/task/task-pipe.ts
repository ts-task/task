import { Task } from './task';
import { UncaughtError } from './uncaught-error';

declare module './task' {
    // tslint:disable-next-line:interface-name
    interface Task <T, E> {
        pipe (): Task<T, E>;
        pipe<T1, E1> (f1: IPipeFn<T, T1, E, E1>): Task<T1, E1 | UncaughtError>;
        pipe<T1, T2, E1, E2> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>): Task<T2, E2 | UncaughtError>;
        pipe<T1, T2, T3, E1, E2, E3> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>): Task<T3, E3 | UncaughtError>;
        pipe<T1, T2, T3, T4, E1, E2, E3, E4> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>): Task<T4, E4 | UncaughtError>;
        pipe<T1, T2, T3, T4, T5, E1, E2, E3, E4, E5> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>): Task<T5, E5 | UncaughtError>;
        pipe<T1, T2, T3, T4, T5, T6, E1, E2, E3, E4, E5, E6> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>): Task<T6, E6 | UncaughtError>;
        pipe<T1, T2, T3, T4, T5, T6, T7, E1, E2, E3, E4, E5, E6, E7> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>, f7: IPipeFn<T6, T7, E6, E7>): Task<T7, E7 | UncaughtError>;
        pipe<T1, T2, T3, T4, T5, T6, T7, T8, E1, E2, E3, E4, E5, E6, E7, E8> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>, f7: IPipeFn<T6, T7, E6, E7>, f8: IPipeFn<T7, T8, E7, E8>): Task<T8, E8 | UncaughtError>;
        pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, E1, E2, E3, E4, E5, E6, E7, E8, E9> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>, f7: IPipeFn<T6, T7, E6, E7>, f8: IPipeFn<T7, T8, E7, E8>, f9: IPipeFn<T8, T9, E8, E9>): Task<T9, E9 | UncaughtError>;
        pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, E1, E2, E3, E4, E5, E6, E7, E8, E9, E10> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>, f7: IPipeFn<T6, T7, E6, E7>, f8: IPipeFn<T7, T8, E7, E8>, f9: IPipeFn<T8, T9, E8, E9>, f10: IPipeFn<T9, T10, E9, E10>): Task<T10, E10 | UncaughtError>;
        pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, E1, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>, f7: IPipeFn<T6, T7, E6, E7>, f8: IPipeFn<T7, T8, E7, E8>, f9: IPipeFn<T8, T9, E8, E9>, f10: IPipeFn<T9, T10, E9, E10>, f11: IPipeFn<T10, T11, E10, E11>): Task<T11, E11 | UncaughtError>;
        pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, E1, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11, E12> (f1: IPipeFn<T, T1, E, E1>, f2: IPipeFn<T1, T2, E1, E2>, f3: IPipeFn<T2, T3, E2, E3>, f4: IPipeFn<T3, T4, E3, E4>, f5: IPipeFn<T4, T5, E4, E5>, f6: IPipeFn<T5, T6, E5, E6>, f7: IPipeFn<T6, T7, E6, E7>, f8: IPipeFn<T7, T8, E7, E8>, f9: IPipeFn<T8, T9, E8, E9>, f10: IPipeFn<T9, T10, E9, E10>, f11: IPipeFn<T10, T11, E10, E11>, f12: IPipeFn<T11, T12, E11, E12>): Task<T12, E12 | UncaughtError>;
    }
}

Task.prototype.pipe = function <TFinal, EFinal> (...fns: any[]): Task<TFinal, EFinal | UncaughtError> {
        return new Task((outerResolve, outerReject) => {
            const newTask = fns.reduce(
                (task, f) => {
                    try {
                        return f(task);
                    } catch (err) {
                        return Task.reject(new UncaughtError(err));
                    }
                },
                this
            );
            return newTask.fork(outerReject, outerResolve);
        });
    };
