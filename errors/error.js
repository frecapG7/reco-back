

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
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



module.exports = {
    NotFoundError,
    ForbiddenError,
    InvalidCreditError,
    InternalServerError,
}