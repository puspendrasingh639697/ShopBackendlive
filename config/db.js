// // import mongoose from 'mongoose';

// // const connectDB = async () => {
// //     try {
// //         const conn = await mongoose.connect(process.env.MONGO_URI);
// //         console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
// //     } catch (error) {
// //         console.error(`❌ DB Connection Error: ${error.message}`);
// //         process.exit(1); // Error aane par app band kar do
// //     }
// // };

// // export default connectDB;

// import mongoose from 'mongoose';

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI, {
//             serverSelectionTimeoutMS: 10000, // 10 seconds tak response na aane par clear error dega
//             tls: true,
//             tlsAllowInvalidCertificates: true, // SSL/TLS handshake bypass
//         });
//         console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error(`❌ DB Connection Error: ${error.message}`);
//         process.exit(1);
//     }
// };

// export default connectDB;

import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            family: 4, // Windows SSL drop ko bypass karega
            serverSelectionTimeoutMS: 15000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ DB Connection Error: ${error.message}`);
    }
};

export default connectDB;