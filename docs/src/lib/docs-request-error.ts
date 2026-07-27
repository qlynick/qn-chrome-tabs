export class DocsRequestError extends Error {
  constructor(
    message: string,
    readonly url: string,
    readonly status?: number,
    readonly hint?: string,
  ) {
    super(message);
    this.name = 'DocsRequestError';
  }
}
