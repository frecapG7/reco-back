const sinon = require("sinon");
const multer = require("multer");
const { upload } = require("./upload");
const path = require("path");

describe("upload middleware", () => {
  sinon.stub(multer, "memoryStorage").returns({});

  const cb = jest.fn();

  beforeEach(() => {
    cb.mockReset();
  });

  it("Should return false when the mimetype is invalid", () => {
    const file = {
      mimetype: "application/pdf",
      originalname: "file.pdf",
    };
    // pathStub.returns(".pdf");

    const result = upload.fileFilter(null, file, cb);

    expect(cb).toHaveBeenCalledWith(
      new Error("Unsupported file type application/pdf")
    );
  });

  it("Should return true when the mimetype is valid", () => {
    const file = {
      mimetype: "image/jpeg",
      originalname: "image.jpg",
    };

    const result = upload.fileFilter(null, file, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });
});
