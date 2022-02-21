// Source: https://www.section.io/engineering-education/data-encryption-and-decryption-in-node-js-using-crypto/

const crypto = require("crypto");

const toEncrypt = "hex",
    fromEncrypt = "utf-8",
    algorithm = "aes-256-cbc",
    key = Buffer.from(process.env.ENCRYPTION_KEY, toEncrypt),
    iv = Buffer.from(process.env.ENCRYPTION_IV, toEncrypt);

function encryptData(src_data) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encryptedData = cipher.update(src_data, fromEncrypt, toEncrypt) + cipher.final(toEncrypt);
    return encryptedData;
}

function decryptData(encrypted_data) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decryptedData = decipher.update(encrypted_data, toEncrypt, fromEncrypt) + decipher.final(fromEncrypt);
    return decryptedData;
}

module.exports.encrypt = encryptData;
module.exports.decrypt = decryptData;