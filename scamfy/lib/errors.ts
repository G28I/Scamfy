/**
 * Custom error class for input validation errors across BFF and domain services.
 */
export class ValidationError extends Error {
  /**
   * Constructs a ValidationError instance with a descriptive error message.
   *
   * @param message - The validation error explanation
   */
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
