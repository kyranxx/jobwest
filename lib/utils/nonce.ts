import { v4 as uuidv4 } from 'uuid';

// Function to generate a random string for the nonce
export const generateNonce = (): string => {
  return uuidv4();
};

// Function to hash the nonce using SHA-256
export const hashNonce = async (nonce: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert ArrayBuffer to a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};
