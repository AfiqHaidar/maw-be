// functions/index.js
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Notification endpoint
app.post('/send-notification', async (req, res) => {
  try {
    const { targetUserId, type, connectionId, fromUserId } = req.body;
    
    if (!targetUserId || !type || !connectionId || !fromUserId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get the target user's FCM token
    const userDoc = await admin.firestore().collection('users').doc(targetUserId).get();
     const userSenderDoc = await admin.firestore().collection('users').doc(fromUserId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Target user not found' });
    }
    
    const userData = userDoc.data();
    const userSenderData = userSenderDoc.data();
    const fcmToken = userData.fcmToken;
    const senderUsername = userSenderData.username;
    
    if (!fcmToken) {
      return res.status(404).json({ error: 'Target user has no FCM token' });
    }
    
    // Prepare notification based on type
    let title, body;
    
    if (type === 'connection_request') {
      title = 'New Connection Request';
      body = `@${senderUsername} wants to connect with you`;
    } else if (type === 'connection_accepted') {
      title = 'Connection Accepted';
      body = `@${senderUsername} accepted your connection request`;
    } else {
      return res.status(400).json({ error: 'Invalid notification type' });
    }
    
    // Prepare message (Send data only to ensure handler processes it)
    const message = {
      data: {
        type: type,
        connectionId: connectionId,
        userId: fromUserId,
        username: senderUsername,
        title: title,
        body: body,
        screen: '/home/inbox',
      },
      token: fcmToken
    };
    
    // Send message
    const response = await admin.messaging().send(message);
    
    res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Export the API as a Firebase Function
exports.notifications = functions.https.onRequest(app);