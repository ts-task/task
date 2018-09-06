export class UnknownError extends Error {
    errorType = 'UnknownError' as 'UnknownError';

    constructor (private error: any) {
        super('UnknownError: ' + error.toString());
    }
}
