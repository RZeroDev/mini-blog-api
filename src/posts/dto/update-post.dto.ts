import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: 'Nouveau titre du post',
    example: 'Introduction à NestJS (mise à jour)',
  })
  @IsOptional()
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Nouveau contenu du post',
    example: 'NestJS est un framework backend puissant...',
  })
  @IsOptional()
  @IsString({ message: 'Le contenu doit être une chaîne de caractères' })
  content?: string;

  @ApiPropertyOptional({
    description: 'Nouvel ID de catégorie',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'L\'ID de catégorie doit être un UUID valide' })
  categoryId?: string;
}
