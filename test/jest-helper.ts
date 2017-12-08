import { UncaughtError } from '../src/task';

export const jestAssertNever =
    (cb: jest.DoneCallback) =>
        (obj: never | UncaughtError) =>
            cb('this should never happen')
;

export const jestAssertUntypedNeverCalled =
    (cb: jest.DoneCallback) =>
        (obj: any) =>
            cb('this should never happen')
;

export const assertFork = <T>(cb: jest.DoneCallback, fn: (obj: T) => void) => (obj: T) => {
    try {
        fn(obj);
        cb();
    } catch (err) {
        cb(err);
    }
};
