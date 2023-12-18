import { JSEncrypt } from 'jsencrypt';

export const encrypt = (publicKey: string, message: string) => {
  const jsEncrypt = new JSEncrypt();
  jsEncrypt.setPublicKey(publicKey);
  return jsEncrypt.encrypt(message);
};
