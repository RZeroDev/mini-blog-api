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
    name: 'Développement Web',
    slug: createSlug('Développement Web'),
    image: 'uploads/categories/developpement-web.webp',
  },
  {
    name: 'Intelligence Artificielle',
    slug: createSlug('Intelligence Artificielle'),
    image: 'uploads/categories/intelligence-artificielle.webp',
  },
  {
    name: 'Cybersécurité',
    slug: createSlug('Cybersécurité'),
    image: 'uploads/categories/cybersecurite.webp',
  },
  {
    name: 'Cloud Computing',
    slug: createSlug('Cloud Computing'),
    image: 'uploads/categories/cloud-computing.webp',
  },
  {
    name: 'Mobile Development',
    slug: createSlug('Mobile Development'),
    image: 'uploads/categories/mobile-development.webp',
  },
];

// Fonction pour générer les articles par catégorie
function generatePostsForCategory(categoryName: string) {
  const postsTemplates: Record<string, Array<{ title: string; content: string }>> = {
    'Développement Web': [
      {
        title: 'Introduction à React et ses Hooks',
        content: 'React est une bibliothèque JavaScript populaire pour construire des interfaces utilisateur. Les Hooks permettent d\'utiliser l\'état et d\'autres fonctionnalités React sans écrire de classe. Dans cet article, nous explorerons les Hooks les plus utilisés comme useState, useEffect, et useContext.',
      },
      {
        title: 'Les meilleures pratiques pour le SEO en 2024',
        content: 'Le référencement naturel (SEO) est crucial pour la visibilité en ligne. Découvrez les dernières tendances et meilleures pratiques pour optimiser votre site web, améliorer votre classement dans les moteurs de recherche et attirer plus de trafic organique.',
      },
      {
        title: 'TypeScript vs JavaScript : Quel choisir ?',
        content: 'TypeScript apporte un système de types statiques à JavaScript, offrant une meilleure sécurité de type et une expérience de développement améliorée. Nous comparerons les avantages et inconvénients de chaque langage pour vous aider à faire le bon choix.',
      },
      {
        title: 'Créer une API REST avec Node.js et Express',
        content: 'Apprenez à construire une API REST robuste en utilisant Node.js et Express. Nous couvrirons la structure des routes, la gestion des erreurs, la validation des données, et les bonnes pratiques pour créer des APIs scalables et maintenables.',
      },
      {
        title: 'Optimisation des performances web',
        content: 'Les performances web sont essentielles pour l\'expérience utilisateur. Découvrez les techniques de base pour optimiser votre site : lazy loading, code splitting, compression d\'images, et mise en cache. Améliorez votre temps de chargement et votre score Core Web Vitals.',
      },
      {
        title: 'GraphQL : Une alternative moderne à REST',
        content: 'GraphQL est un langage de requête pour les APIs qui permet aux clients de demander exactement les données dont ils ont besoin. Explorez les avantages de GraphQL par rapport à REST et apprenez à l\'implémenter dans vos projets.',
      },
      {
        title: 'Les frameworks CSS modernes : Tailwind vs Bootstrap',
        content: 'Comparaison approfondie entre Tailwind CSS et Bootstrap. Découvrez leurs différences, leurs avantages respectifs, et comment choisir le framework qui convient le mieux à votre projet de développement web.',
      },
    ],
    'Intelligence Artificielle': [
      {
        title: 'Introduction au Machine Learning pour débutants',
        content: 'Le Machine Learning est une branche de l\'intelligence artificielle qui permet aux machines d\'apprendre à partir de données. Cet article présente les concepts fondamentaux, les types d\'apprentissage (supervisé, non supervisé, par renforcement), et les applications pratiques.',
      },
      {
        title: 'ChatGPT et les modèles de langage génératifs',
        content: 'Les modèles de langage génératifs comme ChatGPT révolutionnent la façon dont nous interagissons avec l\'IA. Découvrez comment fonctionnent ces modèles, leurs capacités, leurs limites, et leur impact sur différents secteurs.',
      },
      {
        title: 'Deep Learning : Comprendre les réseaux de neurones',
        content: 'Les réseaux de neurones profonds sont au cœur du Deep Learning. Apprenez les concepts de base : perceptrons, couches cachées, fonctions d\'activation, et découvrez comment ces architectures permettent de résoudre des problèmes complexes.',
      },
      {
        title: 'L\'IA dans le domaine médical : Révolution ou risque ?',
        content: 'L\'intelligence artificielle transforme le secteur de la santé avec des applications prometteuses en diagnostic, traitement personnalisé, et recherche. Analysons les opportunités et les défis éthiques de l\'IA médicale.',
      },
      {
        title: 'Computer Vision : Faire voir les machines',
        content: 'La vision par ordinateur permet aux machines de comprendre et d\'interpréter le monde visuel. Explorez les applications de la reconnaissance d\'images, de la détection d\'objets, et les technologies qui rendent cela possible.',
      },
      {
        title: 'L\'éthique de l\'IA : Enjeux et responsabilités',
        content: 'Avec le développement rapide de l\'IA, les questions éthiques deviennent cruciales. Discutons des biais algorithmiques, de la transparence, de la vie privée, et des responsabilités des développeurs et entreprises dans la création d\'IA éthique.',
      },
      {
        title: 'AutoML : Automatiser le Machine Learning',
        content: 'AutoML démocratise l\'apprentissage automatique en automatisant la sélection de modèles et l\'optimisation d\'hyperparamètres. Découvrez comment ces outils permettent même aux non-experts de créer des modèles performants.',
      },
    ],
    'Cybersécurité': [
      {
        title: 'Les bases de la cybersécurité pour les entreprises',
        content: 'La cybersécurité est essentielle pour protéger les données et systèmes des entreprises. Apprenez les fondamentaux : authentification, autorisation, chiffrement, et les mesures de base pour sécuriser votre infrastructure informatique.',
      },
      {
        title: 'Les attaques par phishing : Comment s\'en protéger',
        content: 'Le phishing reste l\'une des menaces les plus courantes en cybersécurité. Découvrez les différentes techniques utilisées par les attaquants, comment les reconnaître, et les meilleures pratiques pour protéger votre organisation et vos utilisateurs.',
      },
      {
        title: 'Chiffrement des données : Protéger vos informations sensibles',
        content: 'Le chiffrement est une méthode fondamentale pour protéger les données. Explorez les différents types de chiffrement (symétrique, asymétrique), les algorithmes modernes, et comment implémenter le chiffrement dans vos applications.',
      },
      {
        title: 'Gestion des mots de passe : Bonnes pratiques',
        content: 'Les mots de passe faibles sont une faille de sécurité majeure. Apprenez les meilleures pratiques pour créer des mots de passe forts, utiliser des gestionnaires de mots de passe, et implémenter l\'authentification à deux facteurs (2FA).',
      },
      {
        title: 'Les vulnérabilités OWASP Top 10 en 2024',
        content: 'L\'OWASP Top 10 liste les risques de sécurité les plus critiques pour les applications web. Découvrez les nouvelles vulnérabilités de 2024, comment les identifier, et les mesures préventives à mettre en place.',
      },
      {
        title: 'Sécurité des APIs : Authentification et autorisation',
        content: 'Les APIs sont des cibles privilégiées pour les attaquants. Apprenez à sécuriser vos APIs avec des méthodes d\'authentification robustes (JWT, OAuth), la gestion des permissions, et les bonnes pratiques de sécurité API.',
      },
      {
        title: 'Incident Response : Réagir face à une cyberattaque',
        content: 'Avoir un plan de réponse aux incidents est crucial pour minimiser les dommages d\'une cyberattaque. Découvrez les étapes clés : détection, confinement, éradication, récupération, et les leçons apprises pour améliorer votre posture de sécurité.',
      },
    ],
    'Cloud Computing': [
      {
        title: 'Introduction au Cloud Computing : Concepts de base',
        content: 'Le Cloud Computing révolutionne la façon dont les entreprises gèrent leurs infrastructures. Découvrez les modèles de service (IaaS, PaaS, SaaS), les avantages du cloud, et comment choisir le bon fournisseur pour vos besoins.',
      },
      {
        title: 'AWS vs Azure vs GCP : Comparaison des géants du cloud',
        content: 'Amazon Web Services, Microsoft Azure, et Google Cloud Platform dominent le marché du cloud. Comparez leurs services, leurs tarifs, leurs forces et faiblesses pour choisir la plateforme qui correspond à votre projet.',
      },
      {
        title: 'Conteneurisation avec Docker et Kubernetes',
        content: 'Docker et Kubernetes sont essentiels pour le déploiement moderne d\'applications. Apprenez à containeriser vos applications, orchestrer vos conteneurs avec Kubernetes, et gérer vos déploiements à l\'échelle dans le cloud.',
      },
      {
        title: 'Serverless Computing : L\'avenir du cloud ?',
        content: 'Le serverless permet de développer et déployer des applications sans gérer de serveurs. Explorez les avantages des fonctions serverless, les cas d\'usage, et comment les services comme AWS Lambda transforment le développement cloud.',
      },
      {
        title: 'Migration vers le cloud : Stratégies et bonnes pratiques',
        content: 'Migrer vers le cloud nécessite une planification minutieuse. Découvrez les différentes stratégies de migration (lift-and-shift, refactoring, rearchitecting), les défis courants, et comment réussir votre transition vers le cloud.',
      },
      {
        title: 'Sécurité et conformité dans le cloud',
        content: 'La sécurité cloud est une responsabilité partagée entre le fournisseur et le client. Apprenez les meilleures pratiques pour sécuriser vos données dans le cloud, gérer les accès, et assurer la conformité réglementaire (RGPD, HIPAA, etc.).',
      },
      {
        title: 'Optimisation des coûts cloud : Réduire votre facture',
        content: 'Les coûts cloud peuvent rapidement s\'envoler sans une gestion appropriée. Découvrez les stratégies pour optimiser vos dépenses : réservation d\'instances, auto-scaling, monitoring, et outils d\'analyse des coûts.',
      },
    ],
    'Mobile Development': [
      {
        title: 'React Native vs Flutter : Quel framework choisir ?',
        content: 'React Native et Flutter sont les deux frameworks les plus populaires pour le développement mobile cross-platform. Comparez leurs performances, leur écosystème, leur courbe d\'apprentissage, et choisissez celui qui convient à votre projet.',
      },
      {
        title: 'Les meilleures pratiques pour le développement iOS',
        content: 'Développer pour iOS nécessite de comprendre Swift, Xcode, et les guidelines Apple. Découvrez les bonnes pratiques pour créer des applications iOS performantes, intuitives, et conformes aux standards de qualité Apple.',
      },
      {
        title: 'Développement Android moderne avec Kotlin',
        content: 'Kotlin est maintenant le langage recommandé pour le développement Android. Apprenez les fonctionnalités modernes de Kotlin, les composants Android Jetpack, et comment créer des applications Android robustes et maintenables.',
      },
      {
        title: 'Progressive Web Apps (PWA) : L\'avenir du mobile ?',
        content: 'Les Progressive Web Apps combinent le meilleur du web et des applications natives. Découvrez comment créer des PWA performantes, fonctionnant hors ligne, et offrant une expérience utilisateur similaire aux applications natives.',
      },
      {
        title: 'Optimisation des performances mobiles',
        content: 'Les performances sont cruciales pour les applications mobiles. Apprenez les techniques d\'optimisation : lazy loading, mise en cache, réduction de la taille des assets, et amélioration du temps de chargement pour une meilleure expérience utilisateur.',
      },
      {
        title: 'Gestion de l\'état dans les applications mobiles',
        content: 'La gestion d\'état est un défi majeur en développement mobile. Explorez les différentes approches : Redux, MobX, Context API, et les patterns modernes pour gérer efficacement l\'état de vos applications mobiles.',
      },
      {
        title: 'Tests et qualité dans le développement mobile',
        content: 'Assurer la qualité des applications mobiles nécessite une stratégie de test complète. Découvrez les différents types de tests (unitaires, d\'intégration, E2E), les outils disponibles, et comment intégrer les tests dans votre workflow de développement.',
      },
    ],
  };

  return postsTemplates[categoryName] || [];
}

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

  // Récupérer l'utilisateur admin pour créer les articles
  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@mini-blog.com' },
  });

  if (!adminUser) {
    console.warn('Admin user not found, skipping posts creation');
    return;
  }

  // Seed des articles pour chaque catégorie
  console.log('Seed posts begin');
  for (const category of categories) {
    const categoryRecord = await prisma.category.findFirst({
      where: { name: category.name },
    });

    if (!categoryRecord) {
      console.warn(`Category ${category.name} not found, skipping posts`);
      continue;
    }

    const posts = generatePostsForCategory(category.name);

    for (const post of posts) {
      const postSlug = createSlug(post.title);
      const existingPost = await prisma.post.findFirst({
        where: { slug: postSlug },
      });

      if (existingPost) {
        await prisma.post.update({
          where: { id: existingPost.id },
          data: {
            title: post.title,
            slug: postSlug,
            content: post.content,
            published: true,
            userId: adminUser.id,
            categoryId: categoryRecord.id,
          },
        });
        console.log(`✅ Article mis à jour: ${post.title}`);
      } else {
        await prisma.post.create({
          data: {
            title: post.title,
            slug: postSlug,
            content: post.content,
            published: true,
            userId: adminUser.id,
            categoryId: categoryRecord.id,
          },
        });
        console.log(`✅ Article créé: ${post.title}`);
      }
    }
    console.log(`✅ ${posts.length} articles créés pour la catégorie: ${category.name}`);
  }
  console.log('Seed posts finish');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
