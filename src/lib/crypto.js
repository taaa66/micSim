/**
 * Cryptographic Utilities
 * ========================
 * Secure password hashing using Web Crypto API (SHA-256)
 * 
 * SECURITY NOTES:
 * - Passwords are NEVER stored in plain text
 * - Each user gets a unique salt
 * - Uses PBKDF2 for key derivation (industry standard)
 * - All operations are async and run in browser
 */

/**
 * Generate a random salt (32 bytes, hex encoded)
 * @returns {string} Random hex string
 */
export function generateSalt() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password with a salt using PBKDF2
 * @param {string} password - Plain text password
 * @param {string} salt - Salt in hex format
 * @returns {Promise<string>} Hashed password in hex format
 */
export async function hashPassword(password, salt) {
  // Convert password and salt to buffer
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = hexToBuffer(salt);

  // Import password as key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 256 bits = 32 bytes
  );

  // Convert to hex string
  return bufferToHex(new Uint8Array(derivedBits));
}

/**
 * Verify a password against a stored hash
 * @param {string} password - Plain text password to verify
 * @param {string} salt - Salt used during hashing
 * @param {string} storedHash - Previously stored hash
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, salt, storedHash) {
  const hash = await hashPassword(password, salt);
  return hash === storedHash;
}

/**
 * Generate a secure session token
 * @returns {string} Random session token
 */
export function generateSessionToken() {
  const array = new Uint8Array(48);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple encryption for non-critical data using AES-GCM
 * NOTE: Key is derived from a fixed salt - suitable for obfuscation only
 * For real security, use Firebase or a backend
 */
export async function encryptData(data, key = 'ophthalmo-sim-key') {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  
  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive key from passphrase
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const cryptoKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('ophthalmo-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    dataBuffer
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return bufferToHex(combined);
}

/**
 * Decrypt data encrypted with encryptData
 */
export async function decryptData(encryptedHex, key = 'ophthalmo-sim-key') {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  const combined = hexToBuffer(encryptedHex);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  // Derive key from passphrase
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const cryptoKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('ophthalmo-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  return JSON.parse(decoder.decode(decrypted));
}

// Helper: Convert hex string to Uint8Array
function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Helper: Convert Uint8Array to hex string
function bufferToHex(buffer) {
  return Array.from(buffer, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Mask sensitive data for display
 * @param {string} value - Value to mask
 * @param {number} showLast - Number of characters to show at end
 * @returns {string} Masked string
 */
export function maskSensitive(value, showLast = 4) {
  if (!value || value.length <= showLast) return '****';
  return '•'.repeat(value.length - showLast) + value.slice(-showLast);
}
