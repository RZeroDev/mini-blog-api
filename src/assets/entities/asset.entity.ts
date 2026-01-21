import { ApiProperty } from '@nestjs/swagger';
import { AssetStatus } from '@prisma/client';
import { UserEntity } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { JsonValue } from '@prisma/client/runtime/library';

export class Asset {
  @ApiProperty()
  id: string;

  @ApiProperty()
  data: JsonValue;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ type: [String] })
  invoices: string[];

  @ApiProperty({ enum: AssetStatus, default: AssetStatus.AVAILABLE })
  status: AssetStatus;

  @ApiProperty({ required: false, type: Number, nullable: true })
  latitude?: number;

  @ApiProperty({ required: false, type: Number, nullable: true })
  longitude?: number;  
  @ApiProperty({ default: false })
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false, type: Date, nullable: true })
  retrouveAt?: Date;

  @ApiProperty({ required: false, type: String, nullable: true })
  retrouveById?: string;

  @ApiProperty({ type: String })
  categoryId: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ type: Category })
  category: Category;

  @ApiProperty({ type: UserEntity })
  user: UserEntity;
}
