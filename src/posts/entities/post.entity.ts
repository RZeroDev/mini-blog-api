import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PostEntity {
  @ApiProperty({ description: 'ID unique du post' })
  id: string;

  @ApiProperty({ description: 'Titre du post' })
  title: string;

  @ApiProperty({ description: 'Contenu du post' })
  content: string;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière modification' })
  updatedAt: Date;

  @ApiProperty({ description: 'ID de l\'auteur' })
  userId: string;

  @ApiProperty({ description: 'ID de la catégorie' })
  categoryId: string;

  // Relations (optionnelles dans les réponses)
  @ApiPropertyOptional({
    description: 'Informations de l\'auteur',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      firstName: 'Admin',
      lastName: 'User',
      picture: 'uploads/users/avatar.jpg',
      email: 'admin@mini-blog.com',
    },
  })
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    picture?: string | null;
    email: string;
  };

  @ApiPropertyOptional({
    description: 'Informations de la catégorie',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Technologies',
      slug: 'technologies',
      image: 'uploads/categories/technologies.webp',
    },
  })
  category?: {
    id: string;
    name: string;
    slug: string;
    image: string;
  };

  constructor(partial: Partial<PostEntity>) {
    Object.assign(this, partial);

    // Nettoyer les données sensibles de l'utilisateur si présent
    if (this.user) {
      this.user = {
        id: this.user.id,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        picture: this.user.picture ?? undefined,
        email: this.user.email,
      };
    }
  }
}
