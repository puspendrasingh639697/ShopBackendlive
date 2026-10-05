import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const create = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected");

    const db = mongoose.connection.db;
    const col = db.collection("bookpoojas");

    // 1. Duplicates delete karo
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
      const [keep, ...remove] = d.ids;
      await col.deleteMany({ _id: { $in: remove } });
      console.log(`  Kept ${keep}, removed ${remove.length}`);
    }

    // 2. Unique index banao
    await col.createIndex(
      { userId: 1, poojaId: 1, dateOfPooja: 1, slot: 1 },
      {
        unique: true,
        partialFilterExpression: { status: { $ne: "cancelled" } },
        name: "unique_booking_slot",
      }
    );

    console.log("✅ Unique index created");

    // 3. Confirm karo
    const indexes = await col.indexes();
    console.log("\n📋 All indexes:");
    indexes.forEach((idx) => {
      console.log(`  - ${idx.name} ${idx.unique ? "(UNIQUE)" : ""}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

create();