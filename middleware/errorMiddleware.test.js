const {
  NotFoundError,
  ForbiddenError,
  InternalServerError,
  AlreadyUsedException,
  UnAuthorizedError,
  UnprocessableEntityError,
  UnSupportedTypeError,
} = require("../errors/error");
const handleError = require("./errorMiddleware");

describe("errorMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should set status to 404 and return error message", () => {
    handleError(new NotFoundError("Test error"), req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Test error" });
  });
  it("should set status to 401 and return error message", () => {
    handleError(new UnAuthorizedError("Test error"), req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Test error" });
  });
  it("should set status to 403 and return error message", () => {
    handleError(new ForbiddenError("Test error"), req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Test error" });
  });

  it("should set status to 410 and return error message", () => {
    handleError(new AlreadyUsedException("Test error"), req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Test error" });
  });

  it("should set status to 400 and return error message", () => {
    handleError(new InternalServerError("Test error"), req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Test error" });
  });

  it("should set status to 422 and return error message", () => {
    handleError(new UnprocessableEntityError("Test error"), req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: "Test error" });
  });

  it("should set status to 415 and return error message", () => {
    handleError(new UnSupportedTypeError("Test error"), req, res, next);
    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.json).toHaveBeenCalledWith({ message: "Test error" });
  });

  it("should set status to 410 and return error message", () => {
    handleError(new AlreadyUsedException("Test error"), req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Test error" });
  });
});
