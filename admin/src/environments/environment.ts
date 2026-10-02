// src/environments/environment.ts
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const environment = {
  production: false,
  apiUrl: isLocal ? 'http://localhost:5000/api' : 'https://api.krisimarg.com/api',
};