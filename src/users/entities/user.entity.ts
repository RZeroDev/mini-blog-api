  import { ApiProperty } from '@nestjs/swagger';
import { RoleEntity } from 'src/roles/entity/role.entity';
import { Exclude } from 'class-transformer';

export class UserEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  picture?: string;

  @ApiProperty()
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  otp?: string;

  @ApiProperty()
  @Exclude()
  otpExpiresAt?: Date;

  @ApiProperty()
  @Exclude()
  emailVerifiedAt?: Date;

  @ApiProperty()
  @Exclude()
  lastEmailSentAt?: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isVerified?: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  @Exclude()
  roleId: string;

  @ApiProperty({ type: () => RoleEntity })
  role: RoleEntity;
}

export interface RequestWithUser extends Request {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}
