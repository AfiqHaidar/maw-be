# MAW-BE: Firebase Cloud Functions Backend

This repository contains the server-side code for the MAW (Mobile Application Workshop) project, implementing push notification services using Firebase Cloud Functions.

## Overview

MAW-BE provides a secure and efficient way to handle push notifications for the MAW mobile application. It uses Firebase Cloud Functions with Express.js to create a RESTful API that sends notifications to users for connection requests and acceptances.

## Features

- **Push Notification Service**: Sends Firebase Cloud Messaging (FCM) notifications to users
- **Connection Request Notifications**: Notifies users when someone sends them a connection request
- **Connection Acceptance Notifications**: Notifies users when someone accepts their connection request
- **User Lookup**: Automatically retrieves usernames from the database for notification messages

## Project Structure

```
MAW-BE/
├── .firebaserc               # Firebase project configuration
├── .gitignore                # Git ignore file
├── firebase.json             # Firebase deployment configuration
└── functions/
    ├── index.js              # Main Express app + Firebase Functions
    ├── package.json          # Node.js dependencies
    ├── package-lock.json     # Dependency lock file
    └── node_modules/         # Node.js modules (not in repo)
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase account with a project set up
- Firestore database configured with user collections

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/maw-be.git
   cd maw-be
   ```

2. Install dependencies:

   ```bash
   cd functions
   npm install
   ```

3. Log in to Firebase:

   ```bash
   firebase login
   ```

4. Link to your Firebase project:
   ```bash
   firebase use --add
   ```

### Local Development

Run the Firebase emulator for local testing:

```bash
firebase emulators:start
```

Your functions will be available at `http://localhost:5001/YOUR_PROJECT_ID/us-central1/notifications`

## API Endpoints

### Send Notification

**Endpoint**: `/notifications/send-notification`

**Method**: POST

**Request Body**:

```json
{
  "targetUserId": "USER_ID_TO_RECEIVE_NOTIFICATION",
  "type": "connection_request", // or "connection_accepted"
  "connectionId": "CONNECTION_DOCUMENT_ID",
  "fromUserId": "SENDER_USER_ID"
}
```

**Response (Success)**:

```json
{
  "success": true,
  "messageId": "projects/YOUR_PROJECT_ID/messages/MESSAGE_ID"
}
```

**Response (Error)**:

```json
{
  "error": "Error message",
  "details": "Error details"
}
```

## Deployment

Deploy the functions to Firebase:

```bash
firebase deploy --only functions
```

After deployment, your API will be available at:

```
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/notifications
```

## Client Integration

In your Flutter app, make API calls to send notifications:

```dart
Future<bool> sendNotification({
  required String targetUserId,
  required String type,
  required String connectionId,
  required String fromUserId,
}) async {
  final response = await http.post(
    Uri.parse('https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/notifications/send-notification'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'targetUserId': targetUserId,
      'type': type,
      'connectionId': connectionId,
      'fromUserId': fromUserId,
    }),
  );

  if (response.statusCode == 200) {
    return true;
  } else {
    print('Error sending notification: ${response.body}');
    return false;
  }
}
```

## FCM Setup in Flutter App

For the Flutter app to receive these notifications:

1. Ensure Firebase is initialized in the app
2. Set up proper FCM token retrieval and storage:
   ```dart
   FirebaseMessaging.instance.getToken().then((token) {
     if (token != null) {
       // Store token in Firestore
       FirebaseFirestore.instance
           .collection('users')
           .doc(userId)
           .update({'fcmToken': token});
     }
   });
   ```
3. Implement notification handling in both foreground and background states
4. Add the `@pragma('vm:entry-point')` annotation to all handlers

## Troubleshooting

### Common Issues

1. **Notifications not appearing**:

   - Check that the FCM token is correctly stored in Firestore
   - Ensure the app has notification permissions
   - Verify that the notification handler is properly annotated with `@pragma('vm:entry-point')`

2. **"User has no FCM token" error**:

   - Make sure the FCM token is being saved to the user's document in Firestore
   - Check that the token is being refreshed when needed

3. **Deployment Errors**:
   - Check your Firebase project permissions
   - Ensure your `package.json` has the correct dependencies
   - Verify that your Firebase CLI is up to date

## License

[MIT License](LICENSE)

## Contributors

- Initial development: Mobile Application Workshop Team

## Contact

For questions or issues, please open an issue in this repository or contact the project maintainers.
