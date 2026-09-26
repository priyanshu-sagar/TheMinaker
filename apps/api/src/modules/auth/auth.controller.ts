import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsPhoneNumber, IsString, Length, MinLength } from 'class-validator';
import { LoginMethod, UserRole } from '@minaker/shared-types';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService, LoginDto, SendOtpDto } from './auth.service';

class LoginRequestDto implements LoginDto {
  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  @MinLength(2)
  tenantSlug!: string;

  @IsString()
  @MinLength(1)
  identifier!: string;   // parentUid | employeeId | phone

  @IsString()
  @MinLength(4)
  credential!: string;   // OTP | PIN

  @IsEnum(LoginMethod)
  loginMethod!: LoginMethod;
}

class SendOtpRequestDto implements SendOtpDto {
  @IsString()
  tenantSlug!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  parentUid?: string;
}

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Unified login endpoint — handles all 4 portal types in one request.
   *
   * Parent:        { role: 'parent',     loginMethod: 'parent_id_otp',   identifier: parentUid,   credential: otp }
   * Gatekeeper:    { role: 'gatekeeper', loginMethod: 'employee_pin',    identifier: employeeId,  credential: pin }
   * Conductor:     { role: 'conductor',  loginMethod: 'employee_pin',    identifier: employeeId,  credential: pin }
   * School Admin:  { role: 'school_admin', loginMethod: 'phone_otp',    identifier: phone,       credential: otp }
   */
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login — all roles, all portals (unified endpoint)' })
  login(@Body() dto: LoginRequestDto) {
    return this.authService.login(dto);
  }

  /**
   * Send OTP — must be called before login for phone_otp and parent_id_otp methods.
   * Not needed for employee_pin (conductor/gatekeeper).
   */
  @Post('send-otp')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone or parent-ID registered phone' })
  sendOtp(@Body() dto: SendOtpRequestDto) {
    return this.authService.sendOtp(dto);
  }
}
