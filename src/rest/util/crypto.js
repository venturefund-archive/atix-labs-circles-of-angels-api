const config = require('config');
const crypto = require('crypto');

const { key } = config.crypto;

module.exports = {
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedText = cipher.update(data);
    encryptedText = Buffer.concat([encryptedText, cipher.final()]);
    return {
      encryptedData: encryptedText.toString('hex'),
      iv: iv.toString('hex')
    };
  },

  decrypt(encryptedData, iv) {
    const ivBuff = Buffer.from(iv, 'hex');
    const encryptedDataBuff = Buffer.from(encryptedData, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuff);

    let decrypted = decipher.update(encryptedDataBuff);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // returns data after decryption
    return decrypted.toString();
  }
};
