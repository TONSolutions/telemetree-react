import CryptoJS from 'crypto-js';
import { JSEncrypt } from 'jsencrypt';

type KeyIV = {
  key: CryptoJS.lib.WordArray;
  iv: CryptoJS.lib.WordArray;
};

export const rsaEncrypt = (publicKey: string, message: string) => {
  const jsEncrypt = new JSEncrypt();
  jsEncrypt.setPublicKey(publicKey);
  return jsEncrypt.encrypt(message);
};

export const generateAESKeyAndIV = () => {
  const key = CryptoJS.lib.WordArray.random(16);
  const iv = CryptoJS.lib.WordArray.random(16);
  return { key, iv };
};

export const encryptWithAES = ({ key, iv }: KeyIV, message: string) => {
  const encrypted = CryptoJS.AES.encrypt(message, key, { iv });
  return encrypted.toString();
};

export const encryptMessage = (rsaPublicKey: string, message: string) => {
  const { key, iv } = generateAESKeyAndIV();
  const keyString = key.toString();
  const ivString = iv.toString();

  const encryptedKey = rsaEncrypt(rsaPublicKey, keyString);

  if (encryptedKey === false) {
    throw new Error('Failed to encrypt AES key.');
  }

  const encryptedIV = rsaEncrypt(rsaPublicKey, ivString);

  if (encryptedIV === false) {
    throw new Error('Failed to encrypt AES IV.');
  }

  const encryptedBody = encryptWithAES({ key, iv }, message);

  return { encryptedKey, encryptedIV, encryptedBody };
};
