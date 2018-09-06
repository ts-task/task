import { UnknownError } from './unknown-error';

const functionThatThrowsAnError = () => {
    throw Error('Boo!');
};

const functionThatThrowsAString = () => {
    throw 'Oh No!';
};

const wrapInUnknown = (error: any) => {
    return new UnknownError(error);
};

describe('UnknownError', () => {
    it('When created with an Error, UnknownError preserves the StackTrace', () => {
        try {
            // GIVEN: a function that throws an Error instance
            functionThatThrowsAnError();
        }
        catch (err) {
            // WHEN: we wrap it in an UnknownError
            const wrappedInUnknownError = wrapInUnknown(err);

            // THEN: We have the stack for the creation of UnknownError concatenated with the original error
            expect(wrappedInUnknownError.stack).toContain('wrapInUnknown');
            expect(wrappedInUnknownError.stack).toContain('-----');
            expect(wrappedInUnknownError.stack).toContain('functionThatThrowsAnError');
        }
    });

    it('When created with a String, UnknownError has only its own stackTrace', () => {
        try {
            // GIVEN: a function that throws a string
            functionThatThrowsAString();
        }
        catch (err) {
            // WHEN: we wrap it in an UnknownError
            const wrappedInUnknownError = wrapInUnknown(err);

            // THEN: We only have the stack for the creation of UnknownError
            expect(wrappedInUnknownError.stack).toContain('wrapInUnknown');
            expect(wrappedInUnknownError.stack).not.toContain('-----');
            expect(wrappedInUnknownError.stack).not.toContain('functionThatThrowsAString');
        }
    });

    it('UnknownError contains originalError', () => {
        try {
            // GIVEN: a function that throws an Error instance
            functionThatThrowsAnError();
        }
        catch (err) {
            // WHEN: we wrap it in an UnknownError
            const wrappedInUnknownError = wrapInUnknown(err);

            // THEN: the original error is wrapped into the UnknownError.
            expect(wrappedInUnknownError.originalError).toBe(err);
        }
    });

    it('When created with an Error, UnknownError\'s message contains the original error\'s message', () => {
        try {
            // GIVEN: a function that throws an Error instance
            functionThatThrowsAnError();
        }
        catch (err) {
            // WHEN: we wrap it in an UnknownError
            const wrappedInUnknownError = wrapInUnknown(err);

            // THEN: the message will contain the words UnknownError and the original message
            expect(wrappedInUnknownError.message).toContain('UnknownError');
            expect(wrappedInUnknownError.message).toContain(err.message);
        }
    });

    it('When created with a String, UnknownError\'s message contains the original string', () => {
        try {
            // GIVEN: a function that throws a string
            functionThatThrowsAString();
        }
        catch (err) {
            // WHEN: we wrap it in an UnknownError
            const wrappedInUnknownError = wrapInUnknown(err);

            // THEN: the message will contain the original string.
            expect(wrappedInUnknownError.message).toContain(err);
        }
    });

});
