import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SignalsService } from './signals.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateSignalDto } from './dto/create-signal.dto';
import { ResponseEntity } from 'src/auth/entity/auth.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from 'src/users/entities/user.entity';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @ApiOperation({ summary: 'Create a signal' })
  @Post('create')
  @ApiResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'assetImages', maxCount: 10 },
      { name: 'placeImages', maxCount: 10 },
    ]),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        createSignalDto: { type: 'object' },
        assetImages: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        placeImages: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['createSignalDto'],
    },
  })
  createSignal(
    @Body() createSignalDto: CreateSignalDto,
    @UploadedFiles()
    files: {
      assetImages?: Express.Multer.File[];
      placeImages?: Express.Multer.File[];
    },
    @Req() req: RequestWithUser,
  ) {
    console.log(files);
    return this.signalsService.createSignal(
      createSignalDto,
      files?.assetImages || [],
      files?.placeImages || [],
      req.user.id,
    );
  }
}
