import { Controller, Get, Post, Delete, Param, Body, Patch, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { PasskeyService } from './passkey.service';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePasskeyProviderDto, PasskeyProviderResponseDto, UpdatePasskeyProviderDto } from './dto/passkey-provider.dto';
import { HasAuthentication } from '../../shared/decorators/auth-swagger.decorator';
import { PasskeyRegistrationOptionsResponseDto, PasskeyRegisterVerifyDto } from './dto/passkey-register.dto';
import { StandardResponseDto } from '../../shared/dto';
import { PasskeyListDTO, PasskeyListItemDTO } from './dto/passkey.dto';
import { PasskeyLoginOptionsDto, PasskeyLoginVerifyDto } from './dto/passkey-login.dto';
import { OTPVerificationResultDto } from '../auth/dto/auth-otp-verify.dto';

@Controller('passkeys')
export class PasskeyController {
  constructor(private readonly passkeyService: PasskeyService) {}

  // #region Passkey List
  @Get()
  @Permissions('user.passkeys.read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get All Passkey For User' })
  @ApiResponse({ status: 200, type: PasskeyListItemDTO })
  @HasAuthentication()
  async getList(@Req() req: Request): Promise<StandardResponseDto<PasskeyListDTO>> {
    return this.passkeyService.getList(req.user.id);
  }
  // #endregion

  // #region PasskeyProvider Admin CRUD
  @Post('providers')
  @Permissions('admin.passkeys-provider.create')
  @ApiOperation({ summary: 'Create a new passkey provider' })
  @ApiResponse({ status: 201, type: PasskeyProviderResponseDto })
  @HasAuthentication()
  async createProvider(@Body() data: CreatePasskeyProviderDto) {
    return this.passkeyService.createProvider(data);
  }

  @Get('providers')
  @Permissions('admin.passkeys-provider.read')
  @ApiOperation({ summary: 'Get all passkey providers' })
  @ApiResponse({ status: 200, type: [PasskeyProviderResponseDto] })
  @HasAuthentication()
  async getAllProviders() {
    return this.passkeyService.findAllProviders();
  }

  @Get('providers/:id')
  @Permissions('admin.passkeys-provider.read')
  @ApiOperation({ summary: 'Get a single passkey provider' })
  @ApiResponse({ status: 200, type: PasskeyProviderResponseDto })
  @HasAuthentication()
  async getProvider(@Param('id') id: number) {
    return this.passkeyService.findProviderById(id);
  }

  @Patch('providers/:id')
  @Permissions('admin.passkeys-provider.update')
  @ApiOperation({ summary: 'Update a passkey provider' })
  @ApiResponse({ status: 200, type: PasskeyProviderResponseDto })
  @HasAuthentication()
  async updateProvider(@Param('id') id: number, @Body() data: UpdatePasskeyProviderDto) {
    return this.passkeyService.updateProvider(id, data);
  }

  @Delete('providers/:id')
  @Permissions('admin.passkeys-provider.delete')
  @ApiOperation({ summary: 'Delete a passkey provider' })
  @ApiResponse({ status: 200 })
  @HasAuthentication()
  async deleteProvider(@Param('id') id: number) {
    return this.passkeyService.deleteProvider(id);
  }
  // #endregion

  // #region Passkey Registration Flow
  @Post('register/generate-options')
  @Permissions('user.register-passkeys-options.create')
  @ApiOperation({ summary: 'Generate registration options for a new passkey' })
  @ApiResponse({
    status: 200,
    type: PasskeyRegistrationOptionsResponseDto,
  })
  @HasAuthentication()
  async generateOptions(@Req() req: Request): Promise<PasskeyRegistrationOptionsResponseDto> {
    return this.passkeyService.generateRegistrationOptions(req.user.id);
  }

  @Post('register/verify')
  @Permissions('user.register-passkeys-verify.create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify and save the new passkey' })
  @ApiResponse({ status: 200, description: 'Passkey successfully registered' })
  @HasAuthentication()
  async verifyRegistration(@Req() req: Request, @Body() body: PasskeyRegisterVerifyDto): Promise<StandardResponseDto<void>> {
    return this.passkeyService.verifyRegistration(req.user.id, req.session, body);
  }

  @Delete('register/revoke/:passkeyId')
  @Permissions('user.register-passkeys-revoke.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a Passkey by ID' })
  @ApiResponse({ status: 200, description: 'Passkey successfully deleted' })
  @HasAuthentication()
  async revokeRegistrationPasskey(@Param('passkeyId') passkeyId: string, @Req() req: any): Promise<StandardResponseDto<void>> {
    return await this.passkeyService.revokeRegistrationPasskey(req.user.id, passkeyId);
  }
  // #endregion

  // #region Passkey Login Flow
  @Post('login/generate-options')
  @Permissions('user.login-passkeys-options.create')
  @ApiOperation({ summary: 'Generate authentication options for passkey login' })
  @ApiResponse({
    status: 200,
    type: PasskeyLoginOptionsDto,
  })
  async generateLoginOptions(): Promise<StandardResponseDto<PasskeyLoginOptionsDto>> {
    return this.passkeyService.generateAuthenticationOptions();
  }

  @Post('login/verify')
  @Permissions('user.login-passkeys-verify.create')
  @ApiOperation({ summary: 'Verify passkey authentication and login user' })
  @ApiResponse({
    status: 200,
    type: OTPVerificationResultDto,
  })
  async verifyLogin(@Body() body: PasskeyLoginVerifyDto): Promise<StandardResponseDto<OTPVerificationResultDto>> {
    return this.passkeyService.verifyAuthentication(body);
  }
  // #endregion
}
