export class UnknownError extends Error {
    errorType = 'UnknownError' as 'UnknownError';

    constructor (public originalError: any) {
        super(`UnknownError (${getErrorMessage(originalError)})`);

        Object.defineProperty(this, 'originalError', {
            enumerable: false,
        });
        Object.defineProperty(this, 'errorType', {
            enumerable: false,
        });

        if (isErrorInstance(originalError)) {
            this.stack = this.stack + '\n--------------\n' + originalError.stack;
        }
    }
}

function getErrorMessage (error: any): string {
    if (isErrorInstance(error)) {
        return error.message;
    } else {
        return error.toString();
    }
}

function isErrorInstance (error: any): error is Error {
    return error instanceof Error;
}