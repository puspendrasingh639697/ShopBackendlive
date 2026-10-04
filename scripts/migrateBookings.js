// scripts/migrateBookings.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const bookings = db.collection("bookpoojas");
    const poojas = db.collection("poojainfos");

    // Purani bookings dhundo jinme poojaName nahi hai
    const all = await bookings
      .find({ poojaName: { $exists: false } })
      .toArray();

    console.log(`📊 Found ${all.length} bookings to migrate`);

    let updated = 0;
    for (const b of all) {
      const pooja = await poojas.findOne({ _id: b.poojaId });

      if (pooja) {
        await bookings.updateOne(
          { _id: b._id },
          {
            $set: {
              poojaName: pooja.PujaName || "Unknown Pooja",
              templeName: pooja.templeName || "Unknown Temple",
              poojaImage: pooja.image || "",
            },
          }
        );
        console.log(`✅ Updated: ${b._id}`);
        updated++;
      } else {
        console.log(`⚠️  Pooja not found for booking: ${b._id}`);
      }
    }

    console.log(`\n🎉 Migration complete! Updated ${updated} bookings`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

migrate();