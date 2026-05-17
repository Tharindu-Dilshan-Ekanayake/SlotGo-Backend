import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

export type RequestWithUser = Request & {
  user?: JwtPayload;
};
