import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export interface EncryptedMessage {
  iv: string;
  encryptedData: string;
  authTag: string;
  salt: string;
}

export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

export function deriveKey(sharedSecret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(sharedSecret, salt, 100000, KEY_LENGTH, 'sha256');
}

export function encrypt(text: string, sharedSecret: string): EncryptedMessage {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(sharedSecret, salt);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encryptedData = cipher.update(text, 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    encryptedData,
    authTag: authTag.toString('hex'),
    salt: salt.toString('hex'),
  };
}

export function decrypt(
  encryptedMessage: EncryptedMessage,
  sharedSecret: string
): string {
  const { iv, encryptedData, authTag, salt } = encryptedMessage;
  const key = deriveKey(sharedSecret, Buffer.from(salt, 'hex'));
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Function to generate a shared secret for a chat room
export function generateChatRoomSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Utility function to verify encryption is working
export function testEncryption(): boolean {
  try {
    const testMessage = 'Test message';
    const secret = generateChatRoomSecret();
    const encrypted = encrypt(testMessage, secret);
    const decrypted = decrypt(encrypted, secret);
    return testMessage === decrypted;
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
}
