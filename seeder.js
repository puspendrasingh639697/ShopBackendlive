import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';

dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected for Seeding...")).catch(err => console.log(err));

const categories = [
    { name: "Puja Samagri", slug: "puja-samagri", description: "Dhoop, agarbatti, camphor, diya, roli, chandan, kalawa, havan samagri, etc." },
    { name: "Puja Kits", slug: "puja-kits", description: "Ganesh, Lakshmi, Shiv, Satyanarayan, Griha Pravesh, Havan, Navratri, Diwali kits." },
    { name: "Yantra", slug: "yantra", description: "Shri Yantra, Kuber, Navgraha, Vastu, Lakshmi, Ganesh, Hanuman yantras." },
    { name: "Rudraksha & Malas", slug: "rudraksha-malas", description: "Rudraksha, Tulsi, Sphatik, gemstone malas and bracelets." },
    { name: "Gemstones", slug: "gemstones", description: "Ruby, Pearl, Emerald, Yellow Sapphire, Blue Sapphire, Hessonite, Cat's Eye." },
    { name: "Idols & Murtis", slug: "idols-murtis", description: "Ganesh, Shiva, Krishna, Lakshmi, Hanuman, Durga, Ram Darbar, Shivling." },
    { name: "Astrology Remedies", slug: "astrology-remedies", description: "Career, business, wealth, marriage, protection, Vastu, Navgraha remedies." },
    { name: "Festival Collections", slug: "festival-collections", description: "Diwali, Navratri, Janmashtami, Mahashivratri and other occasions." },
    { name: "Spiritual Accessories", slug: "spiritual-accessories", description: "Spiritual accessories and personalized products." }
];

const importData = async () => {
    try {
        await Category.deleteMany(); // Purani categories clear karne ke liye (optional)
        await Category.insertMany(categories);
        console.log("✅ All 9 Categories Imported Successfully!");
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();