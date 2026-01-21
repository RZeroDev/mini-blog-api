export function createSlug(str: string): string {
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Génère un pseudo unique basé sur le nom du projet
 * Format: verrou_XXXXXX (où XXXXXX est une combinaison aléatoire de chiffres et lettres)
 */
export function generateUniquePseudo(): string {
  const projectName = 'verrou';
  const randomChars = Math.random().toString(36).substring(2, 8).toLowerCase();
  return `${projectName}_${randomChars}`;
}

/**
 * Génère un pseudo unique avec un préfixe personnalisé
 * @param prefix - Préfixe pour le pseudo
 * @param length - Longueur des caractères aléatoires (défaut: 6)
 */
export function generateCustomPseudo(prefix: string = 'user', length: number = 6): string {
  const randomChars = Math.random().toString(36).substring(2, 2 + length).toLowerCase();
  return `${prefix}_${randomChars}`;
}
