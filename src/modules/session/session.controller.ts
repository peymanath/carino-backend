import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Req } from '@nestjs/common';
import { ApiOkResponse, ApiNoContentResponse, ApiParam, ApiOperation } from '@nestjs/swagger';
import { StandardResponseDto } from '@/shared/dto';
import { SessionDto } from './dto/session.dto';
import { SessionService } from './session.service';
import { HasAuthentication } from '@/shared/decorators/auth-swagger.decorator';

@HasAuthentication()
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List active sessions for current user' })
  @ApiOkResponse({
    description: 'List of active sessions',
    type: [SessionDto],
  })
  async getAllSessions(@Req() req: Request): Promise<StandardResponseDto<SessionDto[]>> {
    return this.sessionService.getUserSessions(req.user.id, req.session);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all sessions except current' })
  @ApiNoContentResponse({
    description: 'All sessions except current were deleted successfully',
  })
  async deleteAllSessionsExceptCurrent(@Req() req: Request): Promise<void> {
    return this.sessionService.deleteAllSessionsExceptCurrent(req.user.id, req.session);
  }

  @Delete(':sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a specific session' })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID (UUID v4)',
    type: String,
  })
  @ApiNoContentResponse({
    description: 'Session deleted successfully',
  })
  async deleteSessionById(@Req() req: Request, @Param('sessionId', new ParseUUIDPipe({ version: '4' })) sessionId: string): Promise<void> {
    // TODO: Connect to service
    return this.sessionService.deleteSessionById(req.user.id, sessionId, req.session);
  }
}
