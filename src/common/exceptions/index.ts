export class BadRequestException extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = "BadRequestException";
  }
}

export class NotFoundException extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundException";
  }
}

export class UnauthorizedException extends Error {
  statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedException";
  }
}

export class ForbiddenException extends Error {
  statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenException";
  }
}