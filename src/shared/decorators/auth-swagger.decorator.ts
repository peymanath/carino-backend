import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function HasAuthentication() {
  return applyDecorators(ApiBearerAuth(), ApiSecurity('session'), UseGuards(JwtAuthGuard));
}
