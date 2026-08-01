export abstract class Failure {
  constructor(public readonly message: string, public readonly code?: string) {}
}

export class ServerFailure extends Failure {
  constructor(message: string = 'Internal Server Error', code?: string) {
    super(message, code);
  }
}

export class AuthFailure extends Failure {
  constructor(message: string = 'Authentication Failed', code?: string) {
    super(message, code);
  }
}

export class NetworkFailure extends Failure {
  constructor(message: string = 'Network Error. Please check your connection.', code?: string) {
    super(message, code);
  }
}

export class ValidationFailure extends Failure {
  constructor(message: string = 'Validation Error', code?: string) {
    super(message, code);
  }
}
