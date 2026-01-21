import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsDate } from 'class-validator';

export class Category {
  @ApiProperty()
  @IsString()
  id: string;
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  slug: string;
  @ApiProperty()
  @IsString()
  image: string;
  @ApiProperty()
  @IsDate()
  createdAt: Date;
  @ApiProperty()
  @IsDate()
  updatedAt: Date;
}
