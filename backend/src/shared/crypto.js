const crypto = require('crypto');

const backupSignKey =
  process.env.BACKUP_SIGN_KEY || process.env.JWT_SECRET || 'finance-backup-sign';

const dataEncryptionKey = crypto
  .createHash('sha256')
  .update(process.env.DATA_ENCRYPTION_KEY || process.env.JWT_SECRET || 'finance-data-key')
  .digest();

const clone = (value) => JSON.parse(JSON.stringify(value));

const signState = (value) =>
  crypto.createHmac('sha256', backupSignKey).update(JSON.stringify(value)).digest('hex');

const encryptField = (value) => {
  if (value === null || typeof value === 'undefined' || value === '') {
    return '';
  }
  if (typeof value !== 'string') {
    return value;
  }
  if (value.startsWith('enc:v1:')) {
    return value;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', dataEncryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
};

const decryptField = (value) => {
  if (typeof value !== 'string' || !value.startsWith('enc:v1:')) {
    return value;
  }
  const parts = value.split(':');
  if (parts.length !== 5) {
    return '';
  }

  try {
    const iv = Buffer.from(parts[2], 'base64');
    const tag = Buffer.from(parts[3], 'base64');
    const ciphertext = Buffer.from(parts[4], 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', dataEncryptionKey, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    return '';
  }
};

const encryptSensitiveState = (rawState) => {
  const next = clone(rawState || {});

  const encryptArrayFields = (collectionName, fields) => {
    if (!Array.isArray(next[collectionName])) {
      return;
    }
    next[collectionName] = next[collectionName].map((item) => {
      const updated = { ...item };
      fields.forEach((field) => {
        if (typeof updated[field] !== 'undefined') {
          updated[field] = encryptField(updated[field]);
        }
      });
      return updated;
    });
  };

  encryptArrayFields('users', ['phone', 'email']);
  encryptArrayFields('customers', ['phone', 'contact']);
  encryptArrayFields('suppliers', ['phone', 'contact']);

  return next;
};

const decryptSensitiveState = (rawState) => {
  const next = clone(rawState || {});

  const decryptArrayFields = (collectionName, fields) => {
    if (!Array.isArray(next[collectionName])) {
      return;
    }
    next[collectionName] = next[collectionName].map((item) => {
      const updated = { ...item };
      fields.forEach((field) => {
        if (typeof updated[field] !== 'undefined') {
          updated[field] = decryptField(updated[field]);
        }
      });
      return updated;
    });
  };

  decryptArrayFields('users', ['phone', 'email']);
  decryptArrayFields('customers', ['phone', 'contact']);
  decryptArrayFields('suppliers', ['phone', 'contact']);

  return next;
};

module.exports = {
  clone,
  signState,
  encryptField,
  decryptField,
  encryptSensitiveState,
  decryptSensitiveState,
};
