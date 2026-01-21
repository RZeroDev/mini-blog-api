import { IsString, IsNotEmpty, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSignalDto {
  @ApiProperty({ description: 'Lieu du signalement' })
  @IsString()
  @IsNotEmpty()
  place: string;

  @ApiPropertyOptional({ description: 'Latitude du lieu' })
  @IsOptional()
  @IsString()
  latitude?: string;

  @ApiPropertyOptional({ description: 'Longitude du lieu'})
  @IsOptional()
  @IsString()
  longitude?: string;

  @ApiProperty({ description: 'Date du signalement', type: String, format: 'date-time' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Heure du signalement', type: String, format: 'date-time' })
  @IsDateString()
  @IsNotEmpty()
  heure: string;

  @ApiProperty({ description: "ID de l'objet concerné" })
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @ApiPropertyOptional({ description: 'Circonstance du signalement' })
  @IsOptional()
  @IsString()
  circonstance?: string;

  @ApiPropertyOptional({ description: 'Statut du signalement', default: false })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}