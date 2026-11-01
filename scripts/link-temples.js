// scripts/link-temples.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Temple from '../models/Temple.js';
import PoojaInfo from '../models/PoojaListModel.js';
import Chadhava from '../models/ChadhavaModel.js';

const DRY_RUN = process.argv.includes('--dry-run');

// ═══════════════════════════════════════════════════════════
//   NAME ALIASES
//   Agar puja/chadhava me temple ka naam thoda alag hai
//   toh yahan mapping daalo
// ═══════════════════════════════════════════════════════════
const NAME_ALIASES = {
  // Puja/Chadhava ka templeName → Temple ka name
  'mahakaleshwar jyotirlinga': 'shri mahakaleshwar jyotirlinga',
  'kashi vishwanath temple': 'kashi vishwanath jyotirlinga',
  'khatu shyam temple': 'khatu shyam ji mandir',
  'trimbakeshwar temple': 'trimbakeshwar jyotirlinga',
  'trimbakeshwar shiva temple': 'trimbakeshwar jyotirlinga',
  'banke bihari temple': 'banke bihari mandir',
  'mahakaleshwar jyotirlinga temple': 'shri mahakaleshwar jyotirlinga',
  'omkareshwar jyotirlinga temple': 'omkareshwar jyotirlinga',
  'kashi vishwanath': 'kashi vishwanath jyotirlinga',
  'shri mahakaleshwar': 'shri mahakaleshwar jyotirlinga',
  'omkareshwar': 'omkareshwar jyotirlinga',
  'banke bihari': 'banke bihari mandir',
  'khatu shyam': 'khatu shyam ji mandir',
  'trimbakeshwar': 'trimbakeshwar jyotirlinga',
  'kashi vishwanath jyotirlinga temple': 'kashi vishwanath jyotirlinga'
};

const normalize = (s) => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');

const resolveName = (rawName) => {
  const n = normalize(rawName);
  return NAME_ALIASES[n] || n;
};

async function link() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`🚀 Mode: ${DRY_RUN ? 'DRY-RUN (no writes)' : 'EXECUTE'}\n`);

  // ── Load all temples ──
  const temples = await Temple.find({ isActive: true }).lean();
  const templeMap = new Map();
  temples.forEach(t => templeMap.set(t.normalizedName, t));

  console.log(`📍 ${temples.length} temples loaded\n`);

  const stats = {
    puja: { matched: 0, unmatched: [], alreadyLinked: 0 },
    chadhava: { matched: 0, unmatched: [], alreadyLinked: 0 }
  };

  // ═══════════════════════════════════════
  //   PUJA LINKING
  // ═══════════════════════════════════════
  console.log('🔗 Linking Pujas...');
  const pujas = await PoojaInfo.find({ isDeleted: false }).lean();

  for (const p of pujas) {
    if (p.templeId) {
      stats.puja.alreadyLinked++;
      continue;
    }

    const resolvedName = resolveName(p.templeName);
    const temple = templeMap.get(resolvedName);

    if (!temple) {
      stats.puja.unmatched.push({ id: p._id, name: p.PujaName, templeName: p.templeName });
      console.log(`  ❌ NO MATCH: "${p.templeName}" (Puja: ${p.PujaName})`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`  🧪 WOULD LINK: ${p.PujaName} → ${temple.name}`);
    } else {
      await PoojaInfo.updateOne({ _id: p._id }, { $set: { templeId: temple._id } });
      console.log(`  ✅ LINKED: ${p.PujaName} → ${temple.name}`);
    }
    stats.puja.matched++;
  }

  // ═══════════════════════════════════════
  //   CHADHAVA LINKING
  // ═══════════════════════════════════════
  console.log('\n🔗 Linking Chadhavas...');
  const chadhavas = await Chadhava.find({ isDeleted: false }).lean();

  for (const c of chadhavas) {
    if (c.templeId) {
      stats.chadhava.alreadyLinked++;
      continue;
    }

    const resolvedName = resolveName(c.templeName);
    const temple = templeMap.get(resolvedName);

    if (!temple) {
      stats.chadhava.unmatched.push({ id: c._id, name: c.name, templeName: c.templeName });
      console.log(`  ❌ NO MATCH: "${c.templeName}" (Chadhava: ${c.name})`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`  🧪 WOULD LINK: ${c.name} → ${temple.name}`);
    } else {
      await Chadhava.updateOne({ _id: c._id }, { $set: { templeId: temple._id } });
      console.log(`  ✅ LINKED: ${c.name} → ${temple.name}`);
    }
    stats.chadhava.matched++;
  }

  // ═══════════════════════════════════════
  //   REPORT
  // ═══════════════════════════════════════
  console.log('\n' + '='.repeat(60));
  console.log(`📊 SUMMARY`);
  console.log('='.repeat(60));
  console.log(`Pujas    → matched: ${stats.puja.matched} | unmatched: ${stats.puja.unmatched.length} | already: ${stats.puja.alreadyLinked}`);
  console.log(`Chadhavas → matched: ${stats.chadhava.matched} | unmatched: ${stats.chadhava.unmatched.length} | already: ${stats.chadhava.alreadyLinked}`);

  if (stats.puja.unmatched.length) {
    console.log('\n❌ UNMATCHED PUJAS:');
    stats.puja.unmatched.forEach(u => console.log(`  - "${u.templeName}" (${u.name})`));
  }
  if (stats.chadhava.unmatched.length) {
    console.log('\n❌ UNMATCHED CHADHAVAS:');
    stats.chadhava.unmatched.forEach(u => console.log(`  - "${u.templeName}" (${u.name})`));
  }

  if (stats.puja.unmatched.length || stats.chadhava.unmatched.length) {
    console.log('\n💡 Fix: Add missing mapping in NAME_ALIASES, or add temple to Temple collection');
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log('\n✨ All linked successfully!');
  await mongoose.disconnect();
}

link();