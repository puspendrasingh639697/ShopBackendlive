import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const migrate = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected");

  const db = mongoose.connection.db;
  const poojas = db.collection("poojainfos");

  const defaultSlots = [
    { name: "morning", time: "06:00 AM - 09:00 AM", maxBookings: 20 },
    { name: "afternoon", time: "12:00 PM - 03:00 PM", maxBookings: 20 },
    { name: "evening", time: "05:00 PM - 08:00 PM", maxBookings: 20 },
  ];

  const result = await poojas.updateMany(
    { slots: { $exists: false } },
    {
      $set: {
        slots: defaultSlots,
        maxBookingsPerDay: 50,
        bookingCutoffHours: 24,
      },
    }
  );

  console.log(`✅ Updated ${result.modifiedCount} poojas`);
  await mongoose.disconnect();
};

migrate().catch(console.error);