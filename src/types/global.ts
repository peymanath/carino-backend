import { SessionDto } from '../modules/session/dto/session.dto';
import { User } from '@prisma/client';

declare global {
  interface Request {
    user: User;
    session: SessionDto | null;
  }
}

export {};
