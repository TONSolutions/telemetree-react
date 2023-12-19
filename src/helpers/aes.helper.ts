import CryptoJS from 'crypto-js';

type KeyIV = {
  key: CryptoJS.lib.WordArray;
  iv: CryptoJS.lib.WordArray;
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
