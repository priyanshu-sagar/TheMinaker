import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { OtpEntity } from './otp.entity';
import { LoginMethod, UserRole } from '@minaker/shared-types';

// ─── DTO Types ────────────────────────────────────────────────────────────────
export interface LoginDto {
  role: UserRole;
  tenantSlug: string;
  identifier: string;    // parentUid | employeeId | phone
  credential: string;    // OTP | PIN
  loginMethod: LoginMethod;
}

export interface SendOtpDto {
  tenantSlug: string;
  phone?: string;
  parentUid?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(OtpEntity)
    private readonly otpRepo: Repository<OtpEntity>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Unified login — handles all 3 credential methods:
   * 1. PHONE_OTP     → school admin, teacher (phone + OTP)
   * 2. PARENT_ID_OTP → parent (parentUid + OTP sent to their registered phone)
   * 3. EMPLOYEE_PIN  → conductor, gatekeeper (employeeId + PIN)
   */
  async login(dto: LoginDto): Promise<{ accessToken: string; user: UserEntity }> {
    let user: UserEntity | null = null;

    switch (dto.loginMethod) {
      case LoginMethod.PHONE_OTP:
        user = await this.loginWithPhoneOtp(dto.identifier, dto.credential, dto.tenantSlug);
        break;
      case LoginMethod.PARENT_ID_OTP:
        user = await this.loginWithParentIdOtp(dto.identifier, dto.credential, dto.tenantSlug);
        break;
      case LoginMethod.EMPLOYEE_PIN:
        user = await this.loginWithEmployeePin(dto.identifier, dto.credential, dto.tenantSlug);
        break;
      default:
        throw new BadRequestException('Invalid login method');
    }

    if (user.role !== dto.role) {
      throw new UnauthorizedException(
        `This account is registered as '${user.role}', not '${dto.role}'`,
      );
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });

    // Update last login
    await this.userRepo.update({ id: user.id }, { lastLoginAt: new Date() });

    return { accessToken, user };
  }

  /** School admin / teacher: phone + OTP */
  private async loginWithPhoneOtp(
    phone: string,
    otp: string,
    tenantSlug: string,
  ): Promise<UserEntity> {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .innerJoin('tenants', 't', 't.id = u.tenant_id AND t.slug = :slug', { slug: tenantSlug })
      .where('u.phone = :phone', { phone })
      .getOne();

    if (!user) throw new NotFoundException('No account found with this phone number');
    await this.verifyOtp(phone, otp);
    return user;
  }

  /** Parent: Parent UID + OTP sent to their registered phone */
  private async loginWithParentIdOtp(
    parentUid: string,
    otp: string,
    tenantSlug: string,
  ): Promise<UserEntity> {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .innerJoin('tenants', 't', 't.id = u.tenant_id AND t.slug = :slug', { slug: tenantSlug })
      .where('u.parent_uid = :parentUid', { parentUid: parentUid.toUpperCase() })
      .getOne();

    if (!user) throw new NotFoundException('Parent ID not found. Check your school letter.');
    if (!user.phone) throw new BadRequestException('No phone number linked to this Parent ID');

    // OTP was sent to the parent's registered phone number
    await this.verifyOtp(user.phone, otp);
    return user;
  }

  /** Conductor / Gatekeeper: employee ID + PIN */
  private async loginWithEmployeePin(
    employeeId: string,
    pin: string,
    tenantSlug: string,
  ): Promise<UserEntity> {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .innerJoin('tenants', 't', 't.id = u.tenant_id AND t.slug = :slug', { slug: tenantSlug })
      .where('u.employee_id = :employeeId', { employeeId })
      .addSelect('u.pin_hash')  // pin_hash is select:false normally
      .getOne();

    if (!user || !user.pinHash) {
      throw new NotFoundException('Employee ID not found or PIN not set');
    }

    const isPinValid = await bcrypt.compare(pin, user.pinHash);
    if (!isPinValid) throw new UnauthorizedException('Incorrect PIN');

    return user;
  }

  /**
   * Send OTP — triggered before phone/parent-ID login.
   * In dev: returns OTP in response body for testing.
   * In prod: dispatches via MSG91 SMS queue (TODO: BullMQ job).
   */
  async sendOtp(dto: SendOtpDto): Promise<{ message: string; devOtp?: string }> {
    let phone: string | undefined;

    if (dto.phone) {
      phone = dto.phone;
      const user = await this.userRepo.findOne({ where: { phone } });
      if (!user) throw new NotFoundException('No account found with this phone number');
    } else if (dto.parentUid) {
      const user = await this.userRepo.findOne({
        where: { parentUid: dto.parentUid.toUpperCase() },
      });
      if (!user || !user.phone) {
        throw new NotFoundException('Parent ID not found or no phone linked');
      }
      phone = user.phone;
    } else {
      throw new BadRequestException('Provide phone or parentUid');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.otpRepo.save(this.otpRepo.create({ phone, otpHash, expiresAt }));

    if (this.config.get('NODE_ENV') === 'development') {
      console.log(`[DEV OTP] ${phone} → ${otp}`);
      return { message: 'OTP sent', devOtp: otp };
    }

    // TODO: dispatch BullMQ job → MSG91 SMS (TRAI DLT compliant)
    return { message: 'OTP sent to your registered phone number' };
  }

  /** Verify OTP record — shared by phone and parent-ID flows */
  private async verifyOtp(phone: string, otp: string): Promise<void> {
    const record = await this.otpRepo.findOne({
      where: { phone },
      order: { createdAt: 'DESC' },
    });

    if (!record) throw new BadRequestException('No OTP found. Request a new one.');
    if (record.expiresAt < new Date()) throw new BadRequestException('OTP expired');
    if (record.verifiedAt) throw new BadRequestException('OTP already used');
    if (record.attempts >= 5) throw new BadRequestException('Too many attempts. Request a new OTP.');

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      await this.otpRepo.increment({ id: record.id }, 'attempts', 1);
      throw new UnauthorizedException('Incorrect OTP');
    }

    await this.otpRepo.update({ id: record.id }, { verifiedAt: new Date() });
  }
}
