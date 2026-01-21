import { PartialType } from '@nestjs/swagger';
import { CreateAlerteDto } from './create-alerte.dto';

export class UpdateAlerteDto extends PartialType(CreateAlerteDto) {}
