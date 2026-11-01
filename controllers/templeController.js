// import Temple from '../models/Temple.js';
// import Chadhava from '../models/ChadhavaModel.js'; 
// import PoojaInfo from '../models/PoojaListModel.js'; // 🔥 APNE FILE KA NAAM DAALO (Pooja.js ya PoojaList.js)
// import axios from 'axios';

// // 1. Admin: Mandir Add
// export const addTemple = async (req, res) => {
//   try {
//     const { name, description, address, latitude, longitude, deity, aartiTimings, image } = req.body;
//     if (!latitude || !longitude) {
//       return res.status(400).json({ success: false, message: "Latitude and Longitude are required!" });
//     }
//     const newTemple = new Temple({
//       name, description, address, deity, image, aartiTimings,
//       location: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] }
//     });
//     await newTemple.save();
//     res.status(201).json({ success: true, message: "Temple added successfully", temple: newTemple });
//   } catch (error) { res.status(500).json({ success: false, message: error.message }); }
// };

// // 2. Nearby Temples
// export const getNearbyTemples = async (req, res) => {
//   try {
//     const { lat, lng, maxDistance = 10000 } = req.query;
//     if (!lat || !lng) return res.status(400).json({ success: false, message: "Lat/Lng required!" });
//     const temples = await Temple.find({
//       isActive: true,
//       location: { $near: { $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] }, $maxDistance: Number(maxDistance) } }
//     });
//     res.status(200).json({ success: true, count: temples.length, temples });
//   } catch (error) { res.status(500).json({ success: false, message: error.message }); }
// };

// // 3. Proximity Alert
// export const checkProximity = async (req, res) => {
//   try {
//     const { lat, lng, userId, fcmToken } = req.body;
//     if (!lat || !lng) return res.status(400).json({ success: false, message: "Lat/Lng required!" });
//     const nearbyTemples = await Temple.find({
//       isActive: true,
//       location: { $near: { $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] }, $maxDistance: 500 } }
//     });
//     if (nearbyTemples.length === 0) return res.status(200).json({ success: true, message: "No temples nearby." });
//     const nearestTemple = nearbyTemples[0];
//     if (fcmToken) console.log(`Notification sent for ${nearestTemple.name}`);
//     res.status(200).json({ success: true, message: "Temple found nearby!", temple: { id: nearestTemple._id, name: nearestTemple.name, aartiTimings: nearestTemple.aartiTimings } });
//   } catch (error) { res.status(500).json({ success: false, message: error.message }); }
// };

// // 4. Mandir ki Details (Puja + Chadhava)
// export const getTempleDetails = async (req, res) => {
//   try {
//     const { templeId } = req.params;
//     const temple = await Temple.findById(templeId);
//     if (!temple) return res.status(404).json({ success: false, message: "Temple not found" });

//     const pujas = await PoojaInfo.find({ templeName: temple.name, status: 'active', isDeleted: false }).select('PujaName price image slots pujaType');
//     const chadhavas = await Chadhava.find({ templeName: temple.name, status: 'active', isDeleted: false }).select('name price image slots chadhavaType');

//     res.status(200).json({ success: true, temple: { ...temple.toObject(), pujas: pujas, chadhavas: chadhavas } });
//   } catch (error) { res.status(500).json({ success: false, message: error.message }); }
// };

// export const fetchTemplesFromOSM = async (req, res) => {
//   try {
//     const { state = "Maharashtra", limit = 50 } = req.query;

//     console.log(`🔍 Fetching temples from OSM for: ${state}`);

//     const overpassQuery = `[out:json][timeout:25];area["name"="${state}"]->.searchArea;node["amenity"="place_of_worship"]["religion"="hindu"](area.searchArea);out body ${limit};`;

//     const params = new URLSearchParams();
//     params.append('data', overpassQuery);

//     // 🔥 FIX: Dusra server use karo
//     const response = await axios.post(
//       'https://overpass.kumi.systems/api/interpreter', // 👈 Yahan badla hai
//       params,
//       { 
//         headers: { 
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Accept': 'application/json'
//         } 
//       }
//     );

//     const elements = response.data.elements || [];
//     console.log(`✅ Found ${elements.length} temples on OSM`);

//     let savedCount = 0;
//     let skippedCount = 0;

//     for (const el of elements) {
//       const { lat, lon, tags } = el;
//       const name = tags.name || tags['name:en'] || tags['name:hi'] || 'Unknown Temple';

//       const existing = await Temple.findOne({ name: name });
//       if (existing) {
//         skippedCount++;
//         continue;
//       }

//       const newTemple = new Temple({
//         name: name,
//         address: tags['addr:full'] || tags['addr:city'] || tags['addr:state'] || state,
//         location: {
//           type: 'Point',
//           coordinates: [Number(lon), Number(lat)]
//         },
//         aartiTimings: [],
//         deity: 'other',
//         image: ''
//       });

//       await newTemple.save();
//       savedCount++;
//     }

//     res.status(200).json({
//       success: true,
//       message: `${savedCount} temples saved, ${skippedCount} skipped.`,
//       total: elements.length,
//       saved: savedCount,
//       skipped: skippedCount
//     });

//   } catch (error) {
//     console.error("❌ OSM Fetch Error:", error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };