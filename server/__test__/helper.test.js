process.env.JWT_SECRET_KEY = "testsecret";

const jwt = require("jsonwebtoken");
const { signToken, verifyToken } = require("../helpers/jwt");

describe("JWT Helper", () => {
  describe("signToken", () => {
    it("should sign token correctly", () => {
      const data = { id: 1, name: "Test" };
      const token = signToken(data);
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      expect(decoded.id).toBe(data.id);
      expect(decoded.name).toBe(data.name);
    });
  });

  describe("verifyToken", () => {
    it("should return decoded token for a valid token", () => {
      const payload = { id: 2, role: "user" };
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.role).toBe(payload.role);
    });

    it("should throw an error for an invalid token", () => {
      expect(() => verifyToken("invalidtoken")).toThrowError(
        expect.objectContaining({
          name: "JsonWebTokenError",
          message: "Invalid or Expired token",
        })
      );
    });
  });
});

const { hashPassword, comparePassword } = require("../helpers/bcrypt");

describe("Bcrypt Helper", () => {
  describe("hashPassword", () => {
    it("should return a hashed password different from the original", () => {
      const password = "mysecretpassword";
      const hashed = hashPassword(password);
      expect(hashed).not.toEqual(password);
      expect(typeof hashed).toBe("string");
    });
  });

  describe("comparePassword", () => {
    it("should return true for the correct password", () => {
      const password = "mysecretpassword";
      const hashed = hashPassword(password);
      const result = comparePassword(password, hashed);
      expect(result).toBe(true);
    });

    it("should return false for an incorrect password", () => {
      const password = "mysecretpassword";
      const hashed = hashPassword(password);
      const result = comparePassword("wrongpassword", hashed);
      expect(result).toBe(false);
    });
  });
});
