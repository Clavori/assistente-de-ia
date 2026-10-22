import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const rawKey = process.env.ENCRYPTION_KEY || 'default-secret-encryption-key-32-chars-atende-ai!';
  // Hash with SHA-256 to ensure exact 32-byte key for aes-256
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * Encrypt a text string or JSON object using AES-256-GCM
 */
export function encrypt(data: string | object): string {
  const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Combine iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a ciphertext string using AES-256-GCM
 */
export function decrypt<T = any>(ciphertext: string): T {
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de cifra inválido.');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted) as T;
    } catch {
      return decrypted as unknown as T;
    }
  } catch (err: any) {
    console.error('Erro ao descriptografar:', err.message);
    throw new Error('Falha ao descriptografar os dados da integração.');
  }
}
