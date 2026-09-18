class ValidationError extends Error {
  constructor(errors) {
    super("Validation failed");
    this.name = "ValidationError";
    this.errors = errors; // { campo: "mensagem" }
  }
}

module.exports = ValidationError;
