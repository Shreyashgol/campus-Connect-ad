/**
 * CampusConnect REST API Backend
 * 
 * Implements the verified API contract:
 * - GET  /user
 * - GET  /user/profile?user_id={id}
 * - GET  /conversation
 * - POST /conversation
 * - GET  /message?conversation_id={id}
 * - POST /message
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// Set large payload limit to support Base64 photo uploads from camera
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory Database (Pre-seeded for evaluation & testing)
let users = [
  { id: 1, name: 'Prof. Vaibhav Chawla', bio: 'Computer Science Department • Faculty Lead' },
  { id: 2, name: 'Shreyash Golhani', bio: '3rd Year CSE • CampusConnect Lead Developer' },
  { id: 3, name: 'Aarav Sharma', bio: 'Class Representative • Mobile Application Dev' },
  { id: 4, name: 'Priya Patel', bio: 'Tech Club Secretary • AI & Data Science' },
  { id: 5, name: 'Rohan Verma', bio: 'Newton School of Technology • CSE Batch 2026' },
];

let conversations = [
  {
    id: 1,
    name: '📢 Campus Notices & Announcements',
    type: 'GROUP',
    createdBy: 1,
    participants_ids: [1, 2, 3, 4, 5],
  },
  {
    id: 2,
    name: 'CSE Final Year Project Group',
    type: 'GROUP',
    createdBy: 2,
    participants_ids: [1, 2, 3],
  },
  {
    id: 3,
    name: 'DM with Prof. Vaibhav',
    type: 'DM',
    createdBy: 2,
    participants_ids: [1, 2],
  },
];

let messages = [
  {
    id: 1,
    conversation_id: 1,
    content: 'Welcome to the official CampusConnect Noticeboard! All major exam dates, lab schedules, and events will be posted here.',
    imageInfo: null,
    senderId: 1,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 2,
    conversation_id: 1,
    content: 'Reminder: Project evaluations and viva reviews start this week. Please ensure your APKs are compiled and tested.',
    imageInfo: null,
    senderId: 1,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 3,
    conversation_id: 3,
    content: 'Good morning Professor! The CampusConnect application has been stabilized and tested.',
    imageInfo: null,
    senderId: 2,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 4,
    conversation_id: 3,
    content: 'Excellent work Shreyash. Please prepare your viva notes and build the standalone APK.',
    imageInfo: null,
    senderId: 1,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

let nextConversationId = 4;
let nextMessageId = 5;

// Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'CampusConnect Backend API',
    version: '1.0.0',
    endpoints: ['/user', '/user/profile', '/conversation', '/message'],
  });
});

// 1. GET /user - Retrieve all campus students
app.get('/user', (req, res) => {
  res.json(users);
});

// 2. GET /user/profile?user_id={id} - Retrieve individual user profile
app.get('/user/profile', (req, res) => {
  const userId = parseInt(req.query.user_id, 10);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// 3. GET /conversation - Retrieve all conversations
app.get('/conversation', (req, res) => {
  res.json(conversations);
});

// 4. POST /conversation - Create a new DM or Group
app.post('/conversation', (req, res) => {
  const { type, name, participants_ids } = req.body;

  if (!type || !Array.isArray(participants_ids) || participants_ids.length === 0) {
    return res.status(400).json({ error: 'type and participants_ids are required' });
  }

  const newConvo = {
    id: nextConversationId++,
    name: name || (type === 'DM' ? 'Direct Message' : 'Campus Group'),
    type: type || 'DM',
    createdBy: 2, // Default to student
    participants_ids: participants_ids.map((id) => parseInt(id, 10)),
  };

  conversations.unshift(newConvo);
  res.status(201).json(newConvo);
});

// 5. GET /message?conversation_id={id} - Fetch message history
app.get('/message', (req, res) => {
  const conversationId = parseInt(req.query.conversation_id, 10);

  if (!conversationId) {
    return res.status(400).json({ error: 'conversation_id is required' });
  }

  const threadMessages = messages.filter(
    (m) => m.conversation_id === conversationId
  );

  res.json({ data: threadMessages });
});

// 6. POST /message - Send text or photo message
app.post('/message', (req, res) => {
  const { conversation_id, content, imageInfo } = req.body;

  if (!conversation_id) {
    return res.status(400).json({ error: 'conversation_id is required' });
  }

  if (!content && !imageInfo) {
    return res.status(400).json({ error: 'content or imageInfo is required' });
  }

  const newMessage = {
    id: nextMessageId++,
    conversation_id: parseInt(conversation_id, 10),
    content: content || null,
    imageInfo: imageInfo || null,
    senderId: 2, // Current student identity
    createdAt: new Date().toISOString(),
  };

  messages.push(newMessage);
  res.status(201).json(newMessage);
});

// Start Server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✓ CampusConnect Backend running on port ${PORT}`);
    console.log(`✓ Health check available at http://localhost:${PORT}/`);
  });
}

// Export app for Vercel Serverless Functions
module.exports = app;
