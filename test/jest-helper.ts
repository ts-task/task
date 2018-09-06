import { UnknownError } from '../src/task';

export const jestAssertNever =
    (cb: jest.DoneCallback) =>
        (obj: never | UnknownError) =>
            cb('this should never happen', obj)
;

export const jestAssertUntypedNeverCalled =
    (cb: jest.DoneCallback) =>
        (obj: any) =>
            cb('this should never happen', obj)
;

export const assertFork = <T>(cb: jest.DoneCallback, fn: (obj: T) => void) => (obj: T) => {
    try {
        fn(obj);
        cb();
    } catch (err) {
        cb(err);
    }
};
