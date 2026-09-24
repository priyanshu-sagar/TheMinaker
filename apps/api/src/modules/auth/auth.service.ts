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

  /** Send OTP to phone (in dev: return OTP in response for testing) */
  async sendOtp(phone: string): Promise<{ message: string; devOtp?: string }> {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) throw new NotFoundException('No account found with this phone number');

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Invalidate old OTPs for this phone
    await this.otpRepo.update({ phone, verifiedAt: undefined as unknown as Date }, { verifiedAt: new Date(0) });

    await this.otpRepo.save(this.otpRepo.create({ phone, otpHash, expiresAt }));

    // In production: dispatch OTP via MSG91 SMS queue
    // For now: log to console in dev
    if (this.config.get('NODE_ENV') === 'development') {
      console.log(`[DEV OTP] Phone: ${phone} → OTP: ${otp}`);
      return { message: 'OTP sent', devOtp: otp };
    }

    // TODO: dispatch via BullMQ → MSG91 SMS service
    return { message: 'OTP sent to your phone number' };
  }

  /** Verify OTP and return JWT tokens */
  async verifyOtp(phone: string, otp: string): Promise<{ accessToken: string }> {
    const record = await this.otpRepo.findOne({
      where: { phone },
      order: { createdAt: 'DESC' },
    });

    if (!record) throw new BadRequestException('No OTP found. Please request a new one.');
    if (record.expiresAt < new Date()) throw new BadRequestException('OTP has expired');
    if (record.verifiedAt) throw new BadRequestException('OTP already used');
    if (record.attempts >= 5) throw new BadRequestException('Too many attempts. Request a new OTP.');

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      await this.otpRepo.increment({ id: record.id }, 'attempts', 1);
      throw new UnauthorizedException('Invalid OTP');
    }

    // Mark as verified
    await this.otpRepo.update({ id: record.id }, { verifiedAt: new Date() });

    const user = await this.userRepo.findOneOrFail({ where: { phone } });
    const accessToken = this.jwtService.sign({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });

    return { accessToken };
  }
}
