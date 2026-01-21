import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { createSlug } from '../src/utils';

const prisma = new PrismaClient();

const roles = [
  {
    name: 'admin',
    label: 'Administrateur',
  },
  {
    name: 'user',
    label: 'Utilisateur',
  },
];

const categories = [
  {
    name: 'Technologies',
    slug: createSlug('Technologies'),
    image: 'uploads/categories/technologies.webp',
  },
  {
    name: 'Informatique',
    slug: createSlug('Informatique'),
    image: 'uploads/categories/informatique.webp',
  },
  {
    name: 'Nature',
    slug: createSlug('Nature'),
    image: 'uploads/categories/moto.webp',
  },
  {
    name: 'Animaux',
    slug: createSlug('Tricycle'),
    image: 'uploads/categories/tricycle.webp',
  },
];

// Utilisateurs de seed pour chaque rôle
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@mini-blog.com',
    password: 'admin123', // sera hashé
    isActive: true,
    isVerified: true,
    roleName: 'admin',
  },
];




async function main() {
  console.log('Seed roles begin');
  for (const role of roles) {
    const existingRole = await prisma.role.findFirst({
      where: { name: role.name },
    });

    if (existingRole) {
      await prisma.role.update({
        where: { id: existingRole.id },
        data: role,
      });
    } else {
      await prisma.role.create({
        data: role,
      });
    }
  }
  console.log('Seed roles finish');

  console.log('Seed categories begin');
  for (const category of categories) {
    const existingCategory = await prisma.category.findFirst({
      where: { name: category.name },
    });
    if (existingCategory) {
      await prisma.category.update({
        where: { id: existingCategory.id },
        data: {
          name: category.name,
          slug: category.slug,
          image: category.image,
        },
      });
    } else {
      await prisma.category.create({
        data: {
          name: category.name,
          slug: category.slug,
          image: category.image,
        },
      });
    }
  }
  console.log('Seed categories finish');

  // Seed des utilisateurs pour chaque rôle
  console.log('Seed users begin');
  for (const user of users) {
    // Récupérer le rôle correspondant
    const role = await prisma.role.findFirst({
      where: { name: user.roleName },
    });
    if (!role) {
      console.warn(`Role ${user.roleName} not found, skipping user ${user.email}`);
      continue;
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: user.email },
    });

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(user.password, 10);



    // Exclure roleName du user avant de passer à Prisma
    const { roleName, ...userData } = user;

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          ...userData,
          password: hashedPassword,
          roleId: role.id,
        },
      });
      console.log(`✅ Utilisateur mis à jour: ${user.email}`);
    } else {
      await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          roleId: role.id,
        },
      });
      console.log(`✅ Utilisateur créé: ${user.email}`);
    }
  }
  console.log('Seed users finish');
  }

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
