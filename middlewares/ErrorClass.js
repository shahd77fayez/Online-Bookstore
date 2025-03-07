export class ErrorClass extends Error {
  constructor(msg, status) {
    super(msg);
    this.status = status;
  }
}
