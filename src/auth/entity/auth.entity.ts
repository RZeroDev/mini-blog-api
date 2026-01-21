import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/users/entities/user.entity';

export class AuthEntity {
  @ApiProperty({ default: 200 })
  statusCode: number = 200;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: () => Object })
  user: UserEntity;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  expiredTokenAt: Date;
}

export class RegisterEntity {
  @ApiProperty({ default: 200 })
  statusCode: number = 200;

  @ApiProperty()
  message: string;
}

export class ResponseEntity {
  @ApiProperty({ default: 200 })
  statusCode: number = 200;
  @ApiProperty()
  data: [];
  @ApiProperty()
  message: string;
}
