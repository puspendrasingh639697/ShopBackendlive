import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected");

    const db = mongoose.connection.db;
    const col = db.collection("bookpoojas");

    const dups = await col.aggregate([
      {
        $group: {
          _id: {
            userId: "$userId",
            poojaId: "$poojaId",
            date: "$dateOfPooja",
            slot: "$slot",
          },
          count: { $sum: 1 },
          ids: { $push: "$_id" },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]).toArray();

    console.log(`📊 Duplicates: ${dups.length}`);
    dups.forEach((d) => {
      console.log(`  - Group:`, d._id, `Count: ${d.count}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

check();