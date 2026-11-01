// scripts/seed-temples.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Temple from '../models/Temple.js';

const DRY_RUN = process.argv.includes('--dry-run');

// ═══════════════════════════════════════════════════════════
//   TOTAL 35 MANDIR (Sir ki list 22 + DB wale 13 extra)
// ═══════════════════════════════════════════════════════════
const temples = [
  // ═══ A) SIR KI LIST (22) ═══
  { name: 'Shri Mahakaleshwar Jyotirlinga', city: 'Ujjain', state: 'Madhya Pradesh', deity: 'shiva', latitude: 23.1828, longitude: 75.7683 },
  { name: 'Kaal Bhairav Mandir', city: 'Ujjain', state: 'Madhya Pradesh', deity: 'shiva', latitude: 23.2317, longitude: 75.7772 },
  { name: 'Trimbakeshwar Jyotirlinga', city: 'Nashik', state: 'Maharashtra', deity: 'shiva', latitude: 19.9333, longitude: 73.5311 },
  { name: 'Kashi Vishwanath Jyotirlinga', city: 'Varanasi', state: 'Uttar Pradesh', deity: 'shiva', latitude: 25.3109, longitude: 83.0104 },
  { name: 'Omkareshwar Jyotirlinga', city: 'Khandwa', state: 'Madhya Pradesh', deity: 'shiva', latitude: 22.2428, longitude: 76.1502 },
  { name: 'Baidyanath Jyotirlinga', city: 'Deoghar', state: 'Jharkhand', deity: 'shiva', latitude: 24.4925, longitude: 86.6999 },
  { name: 'Maa Kamakhya Devi Temple', city: 'Guwahati', state: 'Assam', deity: 'durga', latitude: 26.1664, longitude: 91.7050 },
  { name: 'Kalighat Kali Mandir', city: 'Kolkata', state: 'West Bengal', deity: 'durga', latitude: 22.5186, longitude: 88.3433 },
  { name: 'Dakshineswar Kali Temple', city: 'Kolkata', state: 'West Bengal', deity: 'durga', latitude: 22.6550, longitude: 88.3573 },
  { name: 'Vindhyachal Shaktipeeth', city: 'Mirzapur', state: 'Uttar Pradesh', deity: 'durga', latitude: 25.1500, longitude: 82.5667 },
  { name: 'Maa Chintpurni', city: 'Una', state: 'Himachal Pradesh', deity: 'durga', latitude: 31.7833, longitude: 76.3167 },
  { name: 'Kangra Devi Temple', city: 'Kangra', state: 'Himachal Pradesh', deity: 'durga', latitude: 32.1000, longitude: 76.2667 },
  { name: 'Maa Harsiddhi Shaktipeeth', city: 'Ujjain', state: 'Madhya Pradesh', deity: 'durga', latitude: 23.1815, longitude: 75.7625 },
  { name: 'Khatu Shyam Ji Mandir', city: 'Sikar', state: 'Rajasthan', deity: 'krishna', latitude: 27.8221, longitude: 75.2765 },
  { name: 'Shri Dwarkadhish Temple', city: 'Dwarka', state: 'Gujarat', deity: 'krishna', latitude: 22.2377, longitude: 68.9683 },
  { name: 'Salasar Balaji Mandir', city: 'Churu', state: 'Rajasthan', deity: 'hanuman', latitude: 27.5333, longitude: 74.7000 },
  { name: 'Banke Bihari Mandir', city: 'Vrindavan', state: 'Uttar Pradesh', deity: 'krishna', latitude: 27.5833, longitude: 77.7000 },
  { name: 'Shree Jagannath Temple', city: 'Puri', state: 'Odisha', deity: 'vishnu', latitude: 19.8047, longitude: 85.8174 },
  { name: 'Jageshwar Kuber Mandir', city: 'Almora', state: 'Uttarakhand', deity: 'shiva', latitude: 29.6333, longitude: 79.8500 },
  { name: 'Shani Shingnapur', city: 'Ahmednagar', state: 'Maharashtra', deity: 'other', latitude: 19.3833, longitude: 74.8167 },
  { name: 'Siddhivinayak Temple', city: 'Mumbai', state: 'Maharashtra', deity: 'ganesh', latitude: 19.0169, longitude: 72.8302 },
  { name: 'Dagdusheth Halwai Ganpati', city: 'Pune', state: 'Maharashtra', deity: 'ganesh', latitude: 18.5195, longitude: 73.8567 },

  // ═══ B) DB WALE EXTRA (13) — jo puja/chadhava me use ho rahe hain ═══
  { name: 'Vaidyanath Temple', city: 'Parli', state: 'Maharashtra', deity: 'shiva', latitude: 18.8511, longitude: 76.5014 },
  { name: 'Guruvayur Temple', city: 'Guruvayur', state: 'Kerala', deity: 'krishna', latitude: 10.5948, longitude: 76.0411 },
  { name: 'Shantikunj Ashram', city: 'Haridwar', state: 'Uttarakhand', deity: 'other', latitude: 29.9892, longitude: 78.1633 },
  { name: 'Mangalnath Temple', city: 'Ujjain', state: 'Madhya Pradesh', deity: 'shiva', latitude: 23.2133, longitude: 75.7833 },
  { name: 'Laxmi Narayan Mandir', city: 'Haridwar', state: 'Uttarakhand', deity: 'vishnu', latitude: 29.9457, longitude: 78.1642 },
  { name: 'Tediyatishwar Mahadev Mandir', city: 'Ayodhya', state: 'Uttar Pradesh', deity: 'shiva', latitude: 26.7996, longitude: 82.1946 },
  { name: 'Hanuman Garhi', city: 'Ayodhya', state: 'Uttar Pradesh', deity: 'hanuman', latitude: 26.7975, longitude: 82.1968 },
  { name: 'Tirupati Balaji Temple', city: 'Tirupati', state: 'Andhra Pradesh', deity: 'vishnu', latitude: 13.6833, longitude: 79.3474 },
  { name: 'Shirdi Sai Baba Temple', city: 'Shirdi', state: 'Maharashtra', deity: 'sai_baba', latitude: 19.7665, longitude: 74.4764 },
  { name: 'Vaishno Devi Temple', city: 'Katra', state: 'Jammu', deity: 'durga', latitude: 32.9925, longitude: 74.9508 },
  { name: 'Triveni Sangam', city: 'Prayagraj', state: 'Uttar Pradesh', deity: 'other', latitude: 25.4283, longitude: 81.8839 },
  { name: 'Dashashwamedh Ghat', city: 'Varanasi', state: 'Uttar Pradesh', deity: 'shiva', latitude: 25.3083, longitude: 83.0103 },
  { name: 'Shri Krishna Gaushala', city: 'Mathura', state: 'Uttar Pradesh', deity: 'krishna', latitude: 27.4924, longitude: 77.6737 }
];

const normalize = (s) => s.toLowerCase().trim().replace(/\s+/g, ' ');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`🚀 Mode: ${DRY_RUN ? 'DRY-RUN (no writes)' : 'EXECUTE'}`);
  console.log(`📊 Total temples: ${temples.length}\n`);

  const report = { created: [], skipped: [], failed: [] };

  for (const t of temples) {
    const normalizedName = normalize(t.name);

    try {
      const existing = await Temple.findOne({ normalizedName });
      if (existing) {
        console.log(`⏭️  SKIP (exists): ${t.name}`);
        report.skipped.push(t.name);
        continue;
      }

      const doc = {
        name: t.name,
        normalizedName,
        city: t.city,
        state: t.state,
        deity: t.deity,
        latitude: t.latitude,
        longitude: t.longitude,
        location: {
          type: 'Point',
          coordinates: [t.longitude, t.latitude]
        },
        address: `${t.name}, ${t.city}, ${t.state}, India`
      };

      if (DRY_RUN) {
        console.log(`🧪 WOULD INSERT: ${t.name} → ${t.latitude}, ${t.longitude}`);
      } else {
        await Temple.create(doc);
        console.log(`✅ CREATED: ${t.name} → ${t.latitude}, ${t.longitude}`);
      }
      report.created.push(t.name);
    } catch (err) {
      console.log(`💥 ERROR ${t.name}: ${err.message}`);
      report.failed.push({ name: t.name, reason: err.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📈 Created: ${report.created.length}`);
  console.log(`⏭️  Skipped: ${report.skipped.length}`);
  console.log(`❌ Failed:  ${report.failed.length}`);
  if (report.failed.length) {
    report.failed.forEach(f => console.log(`  ❌ ${f.name}: ${f.reason}`));
  }
  console.log('='.repeat(60));

  await mongoose.disconnect();
  process.exit(report.failed.length ? 1 : 0);
}

seed();