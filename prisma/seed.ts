import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { createSlug, generateUniquePseudo } from '../src/utils';

const prisma = new PrismaClient();

const roles = [
  {
    name: 'admin',
    label: 'Administrateur',
  },
  {
    name: 'secretary',
    label: 'Secrétaire',
  },
  {
    name: 'client',
    label: 'Client',
  },
  {
    name: 'developer',
    label: 'Développeur',
  },
];

const categories = [
  {
    name: 'Véhicule',
    slug: createSlug('Véhicule'),
    image: 'uploads/categories/voiture.webp',
  },
  {
    name: 'Téléphone',
    slug: createSlug('Téléphone'),
    image: 'uploads/categories/phone.webp',
  },
  {
    name: 'Moto',
    slug: createSlug('Moto'),
    image: 'uploads/categories/moto.webp',
  },
  {
    name: 'Tricycle',
    slug: createSlug('Tricycle'),
    image: 'uploads/categories/tricycle.webp',
  },
  {
    name: 'Ordinateur',
    slug: createSlug('Ordinateur'),
    image: 'uploads/categories/ordinateur.webp',
  },
  {
    name: 'Autre',
    slug: createSlug('Autre'),
    image: 'uploads/categories/autre.webp',
  },
];

// Utilisateurs de seed pour chaque rôle
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    phone: '0100000000',
    email: 'admin@verrou.com',
    password: 'admin123', // sera hashé
    isActive: true,
    isVerified: true,
    roleName: 'admin',
  },
  {
    firstName: 'Secrétaire',
    lastName: 'User',
    phone: '0100000001',
    email: 'secretary@verrou.com',
    password: 'secretary123',
    isActive: true,
    isVerified: true,
    roleName: 'secretary',
  },
  {
    firstName: 'Client',
    lastName: 'User',
    phone: '0100000002',
    email: 'client@verrou.com',
    password: 'client123',
    isActive: true,
    isVerified: true,
    roleName: 'client',
  },
  {
    firstName: 'Dev',
    lastName: 'User',
    phone: '0100000003',
    email: 'developer@verrou.com',
    password: 'developer123',
    isActive: true,
    isVerified: true,
    roleName: 'developer',
  },
];

const subscriptions = [
  {
    assetRemaining: 10,
    price: 2000,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    assetRemaining: 20,
    price: 3500,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
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

    // Générer un pseudo unique pour chaque utilisateur
    let pseudo = generateUniquePseudo();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Vérifier que le pseudo généré est unique
    while (!isUnique && attempts < maxAttempts) {
      const existingPseudo = await prisma.user.findFirst({
        where: { pseudo },
      });
      if (!existingPseudo) {
        isUnique = true;
      } else {
        pseudo = generateUniquePseudo();
        attempts++;
      }
    }

    // Exclure roleName du user avant de passer à Prisma
    const { roleName, ...userData } = user;

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          ...userData,
          pseudo,
          password: hashedPassword,
          roleId: role.id,
        },
      });
      console.log(`✅ Utilisateur mis à jour: ${user.email} avec pseudo: ${pseudo}`);
    } else {
      await prisma.user.create({
        data: {
          ...userData,
          pseudo,
          password: hashedPassword,
          roleId: role.id,
        },
      });
      console.log(`✅ Utilisateur créé: ${user.email} avec pseudo: ${pseudo}`);
    }
  }
  console.log('Seed users finish');

  console.log('Seed subscriptions begin');
  for (const subscription of subscriptions) {
    await prisma.subscription.create({
      data: subscription,
    });
  }
  console.log('Seed subscriptions finish');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
