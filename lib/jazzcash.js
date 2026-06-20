import crypto from 'crypto';

// Format Date objects into JazzCash YYYYMMDDHHMMSS timeline format
export function getJazzCashDateTimeString() {
  const pad = (n) => String(n).padStart(2, '0');
  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24-Hour Expiration Window

  const formatDate = (date) => 
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

  return {
    txnDateTime: formatDate(now),
    txnExpiryDateTime: formatDate(expiry)
  };
}

// Alphabetizes elements starting with pp_ and hashes using your Integrity Salt
export function generateSecureHash(fields, integritySalt) {
  const sortedKeys = Object.keys(fields)
    .filter(key => key.startsWith('pp_') && fields[key] !== '')
    .sort();

  const concatenatedString = sortedKeys.map(key => fields[key]).join('&');
  const finalString = `${integritySalt}&${concatenatedString}`;

  return crypto
    .createHmac('sha256', integritySalt)
    .update(finalString)
    .digest('hex')
    .toUpperCase();
}
