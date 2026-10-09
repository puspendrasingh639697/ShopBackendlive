// scripts/setPricing.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const setPricing = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected");

    const db = mongoose.connection.db;
    const col = db.collection("poojainfos");

    const allPoojas = await col.find({}).toArray();
    console.log(`📊 Total poojas: ${allPoojas.length}`);

    let updated = 0;
    let skipped = 0;

    for (const pooja of allPoojas) {
      const basePrice = pooja.price || 0;

      if (basePrice <= 0) {
        console.log(`⏩ Skipped (no price): ${pooja.PujaName}`);
        skipped++;
        continue;
      }

      // Agar pricing already set hai (single > 0) → skip
      if (pooja.pricing?.single > 0) {
        console.log(`⏩ Skipped (already set): ${pooja.PujaName}`);
        skipped++;
        continue;
      }

      const newPricing = {
        single: basePrice,
        family: Math.round(basePrice * 2.35),
        group: Math.round(basePrice * 5.87),
        premium: Math.round(basePrice * 11.75),
      };

      await col.updateOne(
        { _id: pooja._id },
        { $set: { pricing: newPricing } }
      );

      console.log(`✅ Updated: ${pooja.PujaName}`);
      console.log(`   single: ₹${newPricing.single}`);
      console.log(`   family: ₹${newPricing.family}`);
      console.log(`   group: ₹${newPricing.group}`);
      console.log(`   premium: ₹${newPricing.premium}`);

      updated++;
    }

    console.log(`\n🎉 Done! Updated: ${updated}, Skipped: ${skipped}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

setPricing();