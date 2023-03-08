import  speakeasy from 'speakeasy';
import  qrcode from 'qrcode';

function generateSecret() {
  const secret = speakeasy.generateSecret({
    name: 'Efarm',
    issuer: 'Efarm',
  });

  return secret;
}

function generateQRCode(secret) {
  return new Promise((resolve, reject) => {
    qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
      if (err) {
        reject(err);
      } else {
        resolve(dataUrl);
      }
    });
  });
}

function validateToken(secret, token) {
  const isValid = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token: token,
  });

  return isValid;
}

export default {
  generateSecret,
  generateQRCode,
  validateToken,
};