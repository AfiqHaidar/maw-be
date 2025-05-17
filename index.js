// index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// API endpoints
app.post('/api/send-notification', async (req, res) => {
  try {
    const { targetUserId, type, connectionId, fromUserId, username } = req.body;
    
    if (!targetUserId || !type || !connectionId || !fromUserId || !username) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get the target user's FCM token
    const userDoc = await admin.firestore().collection('users').doc(targetUserId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Target user not found' });
    }
    
    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;
    
    if (!fcmToken) {
      return res.status(404).json({ error: 'Target user has no FCM token' });
    }
    
    // Prepare notification based on type
    let title, body;
    
    if (type === 'connection_request') {
      title = 'New Connection Request';
      body = `@${username} wants to connect with you`;
    } else if (type === 'connection_accepted') {
      title = 'Connection Accepted';
      body = `@${username} accepted your connection request`;
    } else {
      return res.status(400).json({ error: 'Invalid notification type' });
    }
    
    // Prepare message (Send data only to ensure our handler processes it)
    const message = {
      data: {
        type: type,
        connectionId: connectionId,
        userId: fromUserId,
        username: username,
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});