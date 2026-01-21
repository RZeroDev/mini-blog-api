import { ApiProperty } from '@nestjs/swagger';

export class Alerte {
  @ApiProperty()
  id: string;
  @ApiProperty()
  assetId: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  motif: string;
  @ApiProperty()
  circonstance: string;
  @ApiProperty()
  status: boolean;
  @ApiProperty()
  date: string;
  @ApiProperty()
  heure: string;
  @ApiProperty()
  place: string;
  @ApiProperty()
  plaintNumber: string;
}
