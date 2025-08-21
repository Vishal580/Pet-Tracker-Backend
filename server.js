// server.js - Express.js Backend for Pet Activity Tracker
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for both development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://petfit.vercel.app'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

// In-memory data storage (as requested - no database)
let petActivities = [];
let chatHistory = [];
let currentPetData = {
  currentPet: '',
  lastWalkReminder: null
};

// AI Response Generator
const generateAIResponse = (message, activities, chatHistory) => {
  const lowerMessage = message.toLowerCase();
  const today = new Date().toDateString();
  const todaysActivities = activities.filter(activity => 
    new Date(activity.dateTime).toDateString() === today
  );

  const walks = todaysActivities.filter(a => a.type === 'walk');
  const meals = todaysActivities.filter(a => a.type === 'meal');
  const meds = todaysActivities.filter(a => a.type === 'medication');

  // Context-aware responses
  if (lowerMessage.includes('walk') || lowerMessage.includes('exercise')) {
    if (walks.length === 0) {
      return `I notice ${currentPetData.currentPet || 'your pet'} hasn't had a walk today yet! Dogs typically need at least 30-60 minutes of exercise daily. Would you like some tips for making walks more engaging?`;
    }
    const totalWalkTime = walks.reduce((sum, walk) => sum + walk.duration, 0);
    return `Great job! ${currentPetData.currentPet || 'Your pet'} has walked for ${totalWalkTime} minutes today. That's ${totalWalkTime >= 30 ? 'excellent' : 'a good start, but they might need a bit more'}!`;
  }

  if (lowerMessage.includes('meal') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
    return `${currentPetData.currentPet || 'Your pet'} has had ${meals.length} meal${meals.length !== 1 ? 's' : ''} today. Most adult dogs do well with 2 meals per day, while cats often prefer 3-4 smaller meals.`;
  }

  if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('med')) {
    return `I see ${meds.length} medication${meds.length !== 1 ? 's' : ''} logged today. It's great that you're keeping track! Always follow your vet's instructions for dosage and timing.`;
  }

  if (lowerMessage.includes('health') || (lowerMessage.includes('how') && lowerMessage.includes('doing'))) {
    return `Based on today's activities, ${currentPetData.currentPet || 'your pet'} seems to be doing well! ${walks.length > 0 ? 'They got some exercise' : 'They could use some exercise'}, had ${meals.length} meal${meals.length !== 1 ? 's' : ''}, and ${meds.length > 0 ? 'took their medication' : 'no medications were needed'}. Regular activity tracking helps ensure their wellbeing!`;
  }

  if (lowerMessage.includes('tip') || lowerMessage.includes('advice')) {
    const tips = [
      "Regular meal times help establish routine and aid digestion.",
      "Interactive toys during walks can make exercise more mentally stimulating.",
      "Keep a consistent medication schedule - setting phone reminders helps!",
      "Watch for changes in eating or activity patterns - they can indicate health issues.",
      "Positive reinforcement during activities strengthens your bond!"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  // Default contextual response
  const recentActivity = todaysActivities[todaysActivities.length - 1];
  if (recentActivity) {
    return `I see you recently logged a ${recentActivity.type} for ${currentPetData.currentPet || 'your pet'}. How are they feeling? I'm here to help with any questions about pet care routines!`;
  }

  return `Hi there! I'm here to help you take the best care of ${currentPetData.currentPet || 'your pet'}. You can ask me about walks, meals, medications, or general pet care tips. What would you like to know?`;
};

// API Routes

// GET /api/activities - Get all activities
app.get('/api/activities', (req, res) => {
  res.json({
    success: true,
    data: {
      activities: petActivities,
      currentPet: currentPetData.currentPet
    }
  });
});

// POST /api/activities - Add new activity
app.post('/api/activities', (req, res) => {
  try {
    const { petName, activityType, duration, dateTime } = req.body;

    // Validation
    if (!petName || !petName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Pet name is required'
      });
    }

    if (!duration || parseFloat(duration) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Duration/quantity must be greater than 0'
      });
    }

    if (!['walk', 'meal', 'medication'].includes(activityType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid activity type'
      });
    }

    const newActivity = {
      id: Date.now(),
      petName: petName.trim(),
      type: activityType,
      duration: parseFloat(duration),
      dateTime: dateTime || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    petActivities.push(newActivity);
    currentPetData.currentPet = petName.trim();

    res.status(201).json({
      success: true,
      data: newActivity,
      message: 'Activity logged successfully'
    });

  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/summary - Get today's activity summary
app.get('/api/summary', (req, res) => {
  try {
    const today = new Date().toDateString();
    const todaysActivities = petActivities.filter(activity => 
      new Date(activity.dateTime).toDateString() === today
    );

    const summary = {
      walks: todaysActivities.filter(a => a.type === 'walk').reduce((sum, a) => sum + a.duration, 0),
      meals: todaysActivities.filter(a => a.type === 'meal').length,
      medications: todaysActivities.filter(a => a.type === 'medication').length,
      totalActivities: todaysActivities.length
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/reminder - Check if walk reminder should be shown
app.get('/api/reminder', (req, res) => {
  try {
    const now = new Date();
    const hour = now.getHours();
    const today = now.toDateString();

    let shouldShowReminder = false;
    let message = '';

    if (hour >= 18 && currentPetData.currentPet) {
      const todaysWalks = petActivities.filter(activity => 
        activity.type === 'walk' && new Date(activity.dateTime).toDateString() === today
      );

      if (todaysWalks.length === 0) {
        shouldShowReminder = true;
        message = `${currentPetData.currentPet} still needs exercise today!`;
      }
    }

    res.json({
      success: true,
      data: {
        showReminder: shouldShowReminder,
        message: message,
        currentTime: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Error checking reminder:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/chat - Handle chat messages
app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: message.trim(),
      timestamp: new Date().toISOString()
    };

    const aiResponse = generateAIResponse(message, petActivities, chatHistory);
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      text: aiResponse,
      timestamp: new Date().toISOString()
    };

    chatHistory.push(userMessage, aiMessage);

    // Keep chat history manageable (last 50 messages)
    if (chatHistory.length > 50) {
      chatHistory = chatHistory.slice(-50);
    }

    res.json({
      success: true,
      data: {
        userMessage,
        aiMessage
      }
    });

  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/chat - Get chat history
app.get('/api/chat', (req, res) => {
  res.json({
    success: true,
    data: chatHistory
  });
});

// DELETE /api/activities/:id - Delete specific activity
app.delete('/api/activities/:id', (req, res) => {
  try {
    const activityId = parseInt(req.params.id);
    const activityIndex = petActivities.findIndex(activity => activity.id === activityId);

    if (activityIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    const deletedActivity = petActivities.splice(activityIndex, 1)[0];

    res.json({
      success: true,
      data: deletedActivity,
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/health - Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Pet Activity Tracker API is running',
    timestamp: new Date().toISOString(),
    stats: {
      totalActivities: petActivities.length,
      chatMessages: chatHistory.length,
      currentPet: currentPetData.currentPet || 'None'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Pet Activity Tracker API running on port ${PORT}`);
});

module.exports = app;