/**
 * Utilitaires pour la sanitisation des données et la prévention des injections
 */

/**
 * Échappe les caractères HTML pour prévenir les attaques XSS
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Nettoie une chaîne pour l'utilisation dans une URL
 */
export function sanitizeUrl(url: string): string {
  // Supprime les caractères dangereux
  return url.replace(/[^\w\-._~:/?#[\]@!$&'()*+,;=]/g, '');
}

/**
 * Valide et nettoie un email
 */
export function sanitizeEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Format d\'email invalide');
  }
  return email.toLowerCase().trim();
}

/**
 * Nettoie les données d'entrée pour les formulaires
 */
export function sanitizeFormData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Supprime les caractères de contrôle et les espaces en début/fin
      sanitized[key] = value.replace(/[\x00-\x1F\x7F]/g, '').trim();
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Valide les données contre les injections SQL basiques
 */
export function validateSqlInput(input: string): boolean {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/|;|'|")/,
    /(\bOR\b|\bAND\b).*?[=<>]/i
  ];
  
  return !sqlInjectionPatterns.some(pattern => pattern.test(input));
}

/**
 * Limite la longueur des chaînes pour éviter les attaques par déni de service
 */
export function limitStringLength(str: string, maxLength: number = 1000): string {
  if (str.length > maxLength) {
    throw new Error(`La chaîne dépasse la longueur maximale autorisée (${maxLength} caractères)`);
  }
  return str;
}

/**
 * Valide et nettoie un numéro de téléphone
 */
export function sanitizePhone(phone: string): string {
  // Supprime tous les caractères non numériques sauf + et espaces
  const cleaned = phone.replace(/[^\d+\s\-()]/g, '');
  
  // Vérifie le format basique
  if (!/^[\d+\s\-()]{8,20}$/.test(cleaned)) {
    throw new Error('Format de téléphone invalide');
  }
  
  return cleaned;
}