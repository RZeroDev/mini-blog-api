import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsString, IsOptional, IsObject, IsIn } from 'class-validator';

export class SendPushNotificationDto {
  @ApiProperty({ type: [String], description: 'Expo push tokens (ExponentPushToken[...])' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tokens: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({ required: false, enum: ['default'], description: 'Notification sound' })
  @IsOptional()
  @IsIn(['default'])
  sound?: 'default';
}


