# 🔐 Private Notifications Usage Guide

## ✅ Implementation Complete!

Your React Native app now supports **private notifications** that are sent to individual users only!

## 🚀 How to Use

### 1. **In Your Login Flow** (Optional Enhancement)

After successful login, you can update the notification service with the user ID:

```typescript
// In your login.tsx or wherever you handle successful login
import { useNotifications } from '@/contexts/NotificationContext';

export default function LoginScreen() {
  const { updateUserId } = useNotifications(); // Get the method from context

  async function onLogin() {
    // ... your existing login code ...
    
    try {
      const data = await apiService.login(email, password);
      
      // Store token
      if (data?.token) {
        await SecureStore.setItemAsync('authToken', data.token);
      }

      // Update notification service with user ID for private channels
      if (data?.user?.id) {
        await updateUserId(data.user.id);
      }

      // ... rest of your login flow ...
    } catch (error) {
      // ... error handling ...
    }
  }
}
```

### 2. **Automatic User ID Detection** (Current Implementation)

The system **automatically** gets the user ID from your API when it initializes, so you don't need to do anything special! It will:

1. ✅ Get auth token from secure storage
2. ✅ Call `/api/auth/user` to get current user data
3. ✅ Extract user ID and subscribe to private channel
4. ✅ Listen for both public and private notifications

## 📱 What You Get

### **Public Notifications** (Existing)
- Sent to ALL students via `students` channel
- Examples: School announcements, general news

### **Private Notifications** (New!)
- Sent to ONE specific user via `private.App.Models.User.{userId}` channel
- Examples: Personal invoice reminders, grade notifications, enrollment confirmations

## 🧪 Testing Private Notifications

### **From Laravel Backend:**

```php
// Send private notification to user ID 123
$user = User::find(123);

// Option 1: Immediate only (real-time, no database storage)
$user->notify(new PrivateImmediateNotification(
    "Payment Received",
    "Your payment of ₱5,000 has been processed successfully."
));

// Option 2: Queued only (database + real-time)
$user->notify(new PrivateQueuedNotification(
    "Grade Posted",
    "Your Math grade for Q1 has been posted: 95"
));

// Option 3: Both (recommended for mobile apps)
$sharedId = 'grade-' . time() . '-' . uniqid();
$user->notify(new PrivateQueuedNotification($title, $message, $url, $sharedId));
$user->notify(new PrivateImmediateNotification($title, $message, null, $sharedId));
```

### **Using Test Routes:**

```bash
# Test private notification to specific user
curl -X POST http://your-app.com/test-private-notification \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "title": "Test Private Notification",
    "message": "This notification is just for you!",
    "type": "both"
  }'

# Test invoice reminder
curl -X POST http://your-app.com/test-invoice-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "invoice_number": "INV-2024-001",
    "amount": 5000
  }'
```

## 🔍 Debug Logs

When working correctly, you'll see these logs in your mobile app:

```
✅ Retrieved user ID for private channel: 123
📱 Subscribing to private channel: private.App.Models.User.123
✅ Successfully subscribed to private user channel
📱 Private notification received via WebSocket: {...}
```

## 📊 Channel Architecture

```
Your Mobile App Now Listens To:
├── Public Channel: 'students'
│   └── Receives: School announcements, general news
└── Private Channel: 'private.App.Models.User.{your_user_id}'
    └── Receives: Personal notifications just for you
```

## 🎯 Real-World Examples

### **Invoice Reminder (Private)**
```php
// Backend sends to specific student
$student->notify(new PrivateQueuedNotification(
    "Invoice Reminder",
    "Your invoice #INV-2024-001 of ₱5,000 is due tomorrow."
));
```

### **School Announcement (Public)**
```php
// Backend sends to all students
Notification::route('broadcast', 'students')
    ->notify(new ImmediateNotification(
        "School Closure",
        "Classes are suspended tomorrow due to weather."
    ));
```

## ✨ Key Benefits

1. **Privacy**: Personal notifications only go to the intended user
2. **Automatic**: Works automatically once user is logged in
3. **Dual Mode**: Supports both public and private notifications simultaneously
4. **Real-time**: Instant delivery via WebSocket
5. **Persistent**: Database storage for important notifications

## 🔧 No Additional Setup Required!

The system is **ready to use** right now! It will:
- ✅ Automatically detect when user logs in
- ✅ Subscribe to their private channel
- ✅ Handle both public and private notifications
- ✅ Show all notifications in the same notifications screen
- ✅ Update badge counts correctly

Just start sending private notifications from your Laravel backend and they'll appear instantly in the mobile app! 🎉
