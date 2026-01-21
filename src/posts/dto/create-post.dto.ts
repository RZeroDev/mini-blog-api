import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Titre du post',
    example: 'Introduction à NestJS',
  })
  @IsNotEmpty({ message: 'Le titre est requis' })
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  title: string;

  @ApiProperty({
    description: 'Contenu du post (peut être du markdown)',
    example:
      'NestJS est un framework backend puissant basé sur TypeScript...',
  })
  @IsNotEmpty({ message: 'Le contenu est requis' })
  @IsString({ message: 'Le contenu doit être une chaîne de caractères' })
  content: string;

  @ApiProperty({
    description: 'ID de la catégorie du post',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'La catégorie est requise' })
  @IsUUID('4', { message: 'L\'ID de catégorie doit être un UUID valide' })
  categoryId: string;
}
