export class UncaughtError extends Error {
    type: 'UncaughtError' = 'UncaughtError';

    constructor (private error: any) {
        super('UncaughtError: ' + error.toString());
    }
}
