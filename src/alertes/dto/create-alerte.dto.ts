import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateAlerteDto {
  @IsNotEmpty()
  @ApiProperty()
  assetId: string;
  @IsNotEmpty()
  @IsNotEmpty()
  @ApiProperty()
  motif: string;
  @IsNotEmpty()
  @ApiProperty()
  circonstance: string;
  @IsNotEmpty()
  @ApiProperty()
  date: string;
  @IsNotEmpty()
  @ApiProperty()
  heure: string;
  @IsNotEmpty()
  @ApiProperty()
  place: string;
  @ApiProperty()
  plaintNumber: string;
}
