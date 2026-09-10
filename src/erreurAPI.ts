export class ErreurApi extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErreurApi';
  }
}