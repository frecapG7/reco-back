

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}


class UnAuthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnAuthorizedError';
        this.statusCode = 401;
    }
}

class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ForbiddenError';
        this.statusCode = 403;
    }
}

class InvalidCreditError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidCreditError';
        this.statusCode = 400;
    }
}

class InternalServerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InternalServerError';
        this.statusCode = 500;
    }
}


class AlreadyUsedException extends Error {
    constructor(message){
        super(message);
        this.name = 'AlreadyUsedException',
        this.statusCode = 409
    }


}



module.exports = {
    NotFoundError,
    UnAuthorizedError,
    ForbiddenError,
    InvalidCreditError,
    InternalServerError,
    AlreadyUsedException
}