// import admin from 'firebase-admin';
// import { readFileSync } from 'fs';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const serviceAccountPath = join(__dirname, 'firebase-service-account.json');

// try {
//   const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });

//   console.log('✅ Firebase Admin initialized');
// } catch (error) {
//   console.error('❌ Firebase Admin init failed:', error.message);
// }

// export default admin;


// console.log('🔍 firebase-admin.js default export:', typeof admin);


import admin from 'firebase-admin';

try {
  let serviceAccount;

  // ✅ Check karein ki Render Environment Variable mila hai ya nahi
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // ✅ Local computer ke liye file read karein
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const serviceAccountPath = join(__dirname, 'firebase-service-account.json');
    
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase Admin init failed:', error.message);
}

export default admin;