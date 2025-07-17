import CryptoJS from 'crypto-js';

export function decryptString(encryptedText, key, iv) {
    //console.log(encryptedText+" "+key+" "+iv);
  if (!encryptedText || !key || !iv) return encryptedText;
  try {
    const keyBytes = CryptoJS.enc.Base64.parse(key);
    const ivBytes = CryptoJS.enc.Base64.parse(iv);
    const bytes = CryptoJS.AES.decrypt(encryptedText, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    //console.log(bytes.toString(CryptoJS.enc.Utf8));
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

export function decryptUser(user, key, iv) {
    //console.log(user+" "+key+" "+iv);
  return {
    userId: user.userId, // Unencrypted
    name: decryptString(user.name, key, iv),
    email: decryptString(user.email, key, iv),
    roles: user.roles?.map(role => decryptString(role, key, iv)) || [],
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  };

}