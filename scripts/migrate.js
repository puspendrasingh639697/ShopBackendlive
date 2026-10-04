// scripts/migrate.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('poojainfos');   // ⚠️ apni collection ka naam check karo

    const total = await collection.countDocuments();
    console.log(`📊 Total documents: ${total}`);

    // 1. status field add karo
    const statusResult = await collection.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );
    console.log(`✅ Added status to ${statusResult.modifiedCount} docs`);

    // 2. isDeleted field add karo
    const deleteResult = await collection.updateMany(
      { isDeleted: { $exists: false } },
      { $set: { isDeleted: false } }
    );
    console.log(`✅ Added isDeleted to ${deleteResult.modifiedCount} docs`);

    // 3. slug generate karo
    const docs = await collection.find({ slug: { $exists: false } }).toArray();
    for (const doc of docs) {
      const baseSlug = (doc.PujaName || 'pooja')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 180);
      const slug = `${baseSlug}-${doc._id.toString().slice(-6)}`;
      await collection.updateOne(
        { _id: doc._id },
        { $set: { slug } }
      );
    }
    console.log(`✅ Added slug to ${docs.length} docs`);

    // 4. pricing add karo
    const priceResult = await collection.updateMany(
      { pricing: { $exists: false } },
      {
        $set: {
          pricing: {
            single: 0,
            family: 0,
            group: 0,
            premium: 0,
          },
        },
      }
    );
    console.log(`✅ Added pricing to ${priceResult.modifiedCount} docs`);

    // 5. bookingCount add karo
    const bookingResult = await collection.updateMany(
      { bookingCount: { $exists: false } },
      { $set: { bookingCount: 0 } }
    );
    console.log(`✅ Added bookingCount to ${bookingResult.modifiedCount} docs`);

    console.log('🎉 Migration complete!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

migrate();