import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class RoleEntity {
  @Exclude()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  label: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
