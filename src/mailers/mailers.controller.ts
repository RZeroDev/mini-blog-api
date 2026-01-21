import { Controller } from '@nestjs/common';
import { MailersService } from './mailers.service';

@Controller('mailers')
export class MailersController {
  constructor(private readonly mailersService: MailersService) {}
}
