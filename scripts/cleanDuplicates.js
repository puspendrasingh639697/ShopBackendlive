import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const clean = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected");

    const db = mongoose.connection.db;
    const col = db.collection("bookpoojas");

    // Purani bookings jinme slot nahi hai — sabse pehle slot add karo
    const updateResult = await col.updateMany(
      { slot: { $exists: false } },
      {
        $set: {
          slot: "morning",
          slotTime: "06:00 AM - 09:00 AM",
        },
      }
    );
    console.log(`📝 Added slot to ${updateResult.modifiedCount} bookings`);

    // Ab duplicates dhundo (slot ke saath)
    const dups = await col.aggregate([
      {
        $group: {
          _id: {
            userId: "$userId",
            poojaId: "$poojaId",
            date: "$dateOfPooja",
            slot: "$slot",
          },
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]).toArray();

    console.log(`📊 Found ${dups.length} duplicate groups`);

    for (const d of dups) {
      // Pehli wali rakho, baaki delete karo
      const [keep, ...remove] = d.ids;
      await col.deleteMany({ _id: { $in: remove } });
      console.log(`  ✅ Kept ${keep}, removed ${remove.length} duplicates`);
    }

    // Final check
    const finalDups = await col.aggregate([
      {
        $group: {
          _id: {
            userId: "$userId",
            poojaId: "$poojaId",
            date: "$dateOfPooja",
            slot: "$slot",
          },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]).toArray();

    console.log(`\n✅ Cleanup complete! Remaining duplicates: ${finalDups.length}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

clean();