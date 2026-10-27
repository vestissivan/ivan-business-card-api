// Claim URLs grant control of a preview. Never print them in a public CI log.
const { readFileSync, writeFileSync } = require('node:fs');
const { randomBytes, createCipheriv, publicEncrypt, constants } = require('node:crypto');
const key = randomBytes(32);
const iv = randomBytes(12);
const cipher = createCipheriv('aes-256-gcm', key, iv);
const receipt = JSON.stringify({ exitCode: Number(process.env.DEPLOY_EXIT_CODE),
  result: readFileSync('/tmp/preview-result.txt', 'utf8'), log: readFileSync('/tmp/preview-log.txt', 'utf8') });
const ciphertext = Buffer.concat([cipher.update(receipt, 'utf8'), cipher.final()]);
writeFileSync('preview-receipt.encrypted.json', JSON.stringify({
  encryptedKey: publicEncrypt({ key: process.env.RECIPIENT_PUBLIC_KEY,
    padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, key).toString('base64'),
  iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'),
  ciphertext: ciphertext.toString('base64'),
}));
console.log('Deployment receipt encrypted for its requester.');
