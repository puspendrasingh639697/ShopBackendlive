// import admin from '../config/firebase-admin.js';
// import FCMToken from '../models/FCMToken.js';

// const sendError = (res, status, message) =>
//   res.status(status).json({ success: false, message });

// // ═══════════════════════════════════════
// //  SAVE FCM TOKEN
// //  POST /api/push-notifications/save-token
// // ═══════════════════════════════════════
// export const saveFCMToken = async (req, res) => {
//   try {
//     const { token, platform = 'web', deviceInfo = '' } = req.body;
//     const userId = req.user?._id || null;

//     if (!token) {
//       return sendError(res, 400, 'FCM token is required');
//     }

//     const savedToken = await FCMToken.findOneAndUpdate(
//       { token },
//       {
//         userId,
//         token,
//         platform,
//         deviceInfo,
//         isActive: true,
//         lastUsed: new Date(),
//       },
//       { upsert: true, new: true }
//     );

//     return res.status(200).json({
//       success: true,
//       message: 'Token saved successfully',
//       data: savedToken,
//     });
//   } catch (error) {
//     console.error('Save FCM token error:', error);
//     return sendError(res, 500, 'Error: ' + error.message);
//   }
// };

// // ═══════════════════════════════════════
// //  SEND PUSH NOTIFICATION (ADMIN)
// //  POST /api/push-notifications/admin/send
// // ═══════════════════════════════════════
// export const sendPushNotification = async (req, res) => {
//   try {
//     const {
//       title,
//       body,
//       imageUrl,
//       targetType = 'all',
//       targetUserId,
//       targetToken,
//       data = {},
//     } = req.body;

//     if (!title || !body) {
//       return sendError(res, 400, 'Title and body are required');
//     }

//     const message = {
//       notification: {
//         title,
//         body,
//         ...(imageUrl && { imageUrl }),
//       },
//       data: Object.keys(data).reduce((acc, key) => {
//         acc[key] = String(data[key]);
//         return acc;
//       }, {}),
//     };

//     let tokens = [];

//     if (targetType === 'all') {
//       const allTokens = await FCMToken.find({ isActive: true }).select('token').lean();
//       tokens = allTokens.map((t) => t.token);
//     } else if (targetType === 'user' && targetUserId) {
//       const userTokens = await FCMToken.find({
//         userId: targetUserId,
//         isActive: true,
//       }).select('token').lean();
//       tokens = userTokens.map((t) => t.token);
//     } else if (targetType === 'token' && targetToken) {
//       tokens = [targetToken];
//     }

//     if (tokens.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No tokens found for the given target',
//       });
//     }

//     const response = await admin.messaging().sendEachForMulticast({
//       ...message,
//       tokens,
//     });

//     const failedTokens = [];
//     response.responses.forEach((resp, idx) => {
//       if (!resp.success) {
//         failedTokens.push(tokens[idx]);
//       }
//     });

//     if (failedTokens.length > 0) {
//       await FCMToken.updateMany(
//         { token: { $in: failedTokens } },
//         { isActive: false }
//       );
//     }

//     return res.status(200).json({
//       success: true,
//       message: `Notification sent to ${response.successCount} device(s)`,
//       totalTokens: tokens.length,
//       successCount: response.successCount,
//       failureCount: response.failureCount,
//     });
//   } catch (error) {
//     console.error('Send notification error:', error);
//     return sendError(res, 500, 'Error: ' + error.message);
//   }
// };

// // ═══════════════════════════════════════
// //  GET ALL TOKENS (ADMIN)
// //  GET /api/push-notifications/admin/tokens
// // ═══════════════════════════════════════
// export const getAllFCMTokens = async (req, res) => {
//   try {
//     const tokens = await FCMToken.find({ isActive: true })
//       .populate('userId', 'name email')
//       .sort({ lastUsed: -1 })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       count: tokens.length,
//       data: tokens,
//     });
//   } catch (error) {
//     return sendError(res, 500, 'Error: ' + error.message);
//   }
// };

import admin from '../config/firebase-admin.js';
import FCMToken from '../models/FCMToken.js';

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

// ═══════════════════════════════════════
//  SAVE FCM TOKEN
//  POST /api/push-notifications/save-token
// ═══════════════════════════════════════
export const saveFCMToken = async (req, res) => {
  try {
    const { token, platform = 'web', deviceInfo = '' } = req.body;
    const userId = req.user?._id || null;

    if (!token) {
      return sendError(res, 400, 'FCM token is required');
    }

    const savedToken = await FCMToken.findOneAndUpdate(
      { token },
      {
        userId,
        token,
        platform,
        deviceInfo,
        isActive: true,
        lastUsed: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Token saved successfully',
      data: savedToken,
    });
  } catch (error) {
    console.error('Save FCM token error:', error);
    return sendError(res, 500, 'Error: ' + error.message);
  }
};

// ═══════════════════════════════════════
//  SEND PUSH NOTIFICATION (ADMIN)
//  POST /api/push-notifications/admin/send
// ═══════════════════════════════════════
export const sendPushNotification = async (req, res) => {
  try {
    // ✅ DEBUG LOGS
    console.log("\n🔔 ===== SEND NOTIFICATION REQUEST =====");
    console.log("BODY DATA:", req.body);

    const {
      title,
      body,
      imageUrl,
      targetType = 'all',
      targetUserId,
      targetToken,
      data = {},
    } = req.body;

    if (!title || !body) {
      return sendError(res, 400, 'Title and body are required');
    }

    const message = {
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl }),
      },
      data: Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key]);
        return acc;
      }, {}),
    };

    let tokens = [];

    if (targetType === 'all') {
      const allTokens = await FCMToken.find({ isActive: true }).select('token').lean();
      tokens = allTokens.map((t) => t.token);
    } else if (targetType === 'user' && targetUserId) {
      const userTokens = await FCMToken.find({
        userId: targetUserId,
        isActive: true,
      }).select('token').lean();
      tokens = userTokens.map((t) => t.token);
    } else if (targetType === 'token' && targetToken) {
      tokens = [targetToken];
    }

    console.log("TOTAL TOKENS TO SEND:", tokens.length);

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No tokens found for the given target',
      });
    }

    const response = await admin.messaging().sendEachForMulticast({
      ...message,
      tokens,
    });

    // ✅ FCM RESPONSE LOGS
    console.log("✅ FCM RESPONSE:");
    console.log("  Success Count:", response.successCount);
    console.log("  Failure Count:", response.failureCount);
    
    // ✅ Failed tokens ka exact reason print karein
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        console.log(`  ❌ Token ${idx + 1} Failed:`, resp.error?.message);
      }
    });

    const failedTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
      }
    });

    if (failedTokens.length > 0) {
      await FCMToken.updateMany(
        { token: { $in: failedTokens } },
        { isActive: false }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Notification sent to ${response.successCount} device(s)`,
      totalTokens: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error('❌ Send notification error:', error);
    return sendError(res, 500, 'Error: ' + error.message);
  }
};

// ═══════════════════════════════════════
//  GET ALL TOKENS (ADMIN)
//  GET /api/push-notifications/admin/tokens
// ═══════════════════════════════════════
export const getAllFCMTokens = async (req, res) => {
  try {
    const tokens = await FCMToken.find({ isActive: true })
      .populate('userId', 'name email')
      .sort({ lastUsed: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: tokens.length,
      data: tokens,
    });
  } catch (error) {
    return sendError(res, 500, 'Error: ' + error.message);
  }
};