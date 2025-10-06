const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Configure CORS to allow Vercel frontend
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://book-9l3z.vercel.app',
    /\.vercel\.app$/  // Allow all Vercel preview URLs
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
      connectTimeoutMS: 30000, // 30 second timeout
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    console.error('Please check your MongoDB Atlas IP whitelist settings');
    console.error('Current environment:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI_EXISTS: !!process.env.MONGODB_URI
    });
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Subject Schema
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Subject = mongoose.model('Subject', subjectSchema);

// State Schema
const stateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const State = mongoose.model('State', stateSchema);

// School Type Schema
const schoolTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const SchoolType = mongoose.model('SchoolType', schoolTypeSchema);

// Content Schema (unified for all content types)
const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  type: { type: String, required: true }, // 'learning-page', 'exercise', 'exercise-with-solution'
  state: { type: String },
  schoolType: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Content = mongoose.model('Content', contentSchema);

// Keep legacy schemas for backward compatibility
const learningPageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  subject: { type: String, required: true },
  difficulty: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const LearningPage = mongoose.model('LearningPage', learningPageSchema);

const exerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  subject: { type: String, required: true },
  difficulty: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Exercise = mongoose.model('Exercise', exerciseSchema);

// Middleware for JWT verification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'OK', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected' });
  }
});

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate content
app.post('/api/generate-content', authenticateToken, async (req, res) => {
  try {
    const { type, subject, topic, difficulty, provider = 'openai', customPrompt, state, schoolType } = req.body;

    let prompt = '';

    // Build context information
    let contextInfo = '';
    if (state) {
      contextInfo += `State/Location: ${state}\n`;
    }
    if (schoolType) {
      contextInfo += `School Type: ${schoolType}\n`;
    }

    switch (type) {
      case 'learning-page':
        prompt = `Create a comprehensive learning page about "${topic}" in the subject of "${subject}".
        Difficulty level: ${difficulty}.
        ${contextInfo ? `Context:\n${contextInfo}` : ''}
        Include:
        - Clear explanations
        - Key concepts
        - Examples
        - Visual descriptions where helpful
        Format as markdown with proper headings.`;
        break;

      case 'exercise':
        prompt = `Create a ${difficulty} level exercise about "${topic}" in the subject of "${subject}".
        ${contextInfo ? `Context:\n${contextInfo}` : ''}
        Include:
        - A clear question/problem
        - DO NOT include the solution
        Format as markdown.`;
        break;

      case 'exercise-with-solution':
        prompt = `Create a ${difficulty} level exercise with complete solution path about "${topic}" in the subject of "${subject}".
        ${contextInfo ? `Context:\n${contextInfo}` : ''}
        Include:
        - A clear question/problem
        - Step-by-step solution path
        - Detailed explanation of each step
        - Key concepts and reasoning
        Format as markdown with clear sections.`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid content type' });
    }

    // Add custom prompt if provided
    if (customPrompt && customPrompt.trim()) {
      prompt += `\n\nAdditional instructions: ${customPrompt}`;
    }

    let content = '';

    if (provider === 'mistral') {
      // Use Mistral AI
      const mistralApiKey = process.env.MISTRAL_API_KEY;
      if (!mistralApiKey) {
        return res.status(500).json({ error: 'Mistral API key not configured' });
      }

      const mistralResponse = await axios.post('https://api.mistral.ai/v1/chat/completions', {
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Create high-quality, engaging learning materials that are clear, accurate, and pedagogically sound.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mistralApiKey}`,
        },
      });

      content = mistralResponse.data.choices[0]?.message?.content || '';
    } else {
      // Use OpenAI (default)
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      const openai = new OpenAI({
        apiKey: openaiApiKey,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert educational content creator. Create high-quality, engaging learning materials that are clear, accurate, and pedagogically sound."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      content = completion.choices[0]?.message?.content || '';
    }

    res.json({ content, provider });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Save generated content
app.post('/api/content', authenticateToken, async (req, res) => {
  try {
    const { title, content, subject, topic, difficulty, type, state, schoolType } = req.body;

    if (!title || !content || !subject || !topic || !difficulty || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const savedContent = await Content.create({
      title,
      content,
      subject,
      topic,
      difficulty,
      type,
      state: state || '',
      schoolType: schoolType || '',
      userId: req.user.userId,
    });

    res.status(201).json({
      message: 'Content saved successfully',
      content: savedContent,
    });
  } catch (error) {
    console.error('Error saving content:', error);
    res.status(500).json({ message: 'Failed to save content' });
  }
});

// Get all saved content for user
app.get('/api/content', authenticateToken, async (req, res) => {
  try {
    const contents = await Content.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(contents);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Failed to fetch content' });
  }
});

// Get content statistics for user
app.get('/api/content/stats', authenticateToken, async (req, res) => {
  try {
    const contents = await Content.find({ userId: req.user.userId });
    
    const stats = {
      totalContent: contents.length,
      learningPages: contents.filter(c => c.type === 'learning-page').length,
      exercises: contents.filter(c => c.type === 'exercise').length,
      exercisesWithSolution: contents.filter(c => c.type === 'exercise-with-solution').length,
      uniqueSubjects: [...new Set(contents.map(c => c.subject))].length,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching content stats:', error);
    res.status(500).json({ message: 'Failed to fetch content stats' });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all subjects for the user
app.get('/api/subjects', authenticateToken, async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user.userId }).sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
});

// Create a new subject
app.post('/api/subjects', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    // Check if subject already exists for this user
    const existingSubject = await Subject.findOne({ 
      name: name.trim(), 
      userId: req.user.userId 
    });

    if (existingSubject) {
      return res.status(400).json({ message: 'Subject already exists' });
    }

    const subject = await Subject.create({
      name: name.trim(),
      description: description || '',
      userId: req.user.userId,
    });

    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Failed to create subject' });
  }
});

// Delete a subject
app.delete('/api/subjects/:id', authenticateToken, async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Failed to delete subject' });
  }
});

// Get all states for the user
app.get('/api/states', authenticateToken, async (req, res) => {
  try {
    const states = await State.find({ userId: req.user.userId }).sort({ name: 1 });
    res.json(states);
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ message: 'Failed to fetch states' });
  }
});

// Create a new state
app.post('/api/states', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'State name is required' });
    }

    // Check if state already exists for this user
    const existingState = await State.findOne({ 
      name: name.trim(), 
      userId: req.user.userId 
    });

    if (existingState) {
      return res.status(400).json({ message: 'State already exists' });
    }

    const state = await State.create({
      name: name.trim(),
      userId: req.user.userId,
    });

    res.status(201).json(state);
  } catch (error) {
    console.error('Error creating state:', error);
    res.status(500).json({ message: 'Failed to create state' });
  }
});

// Get all school types for the user
app.get('/api/school-types', authenticateToken, async (req, res) => {
  try {
    const schoolTypes = await SchoolType.find({ userId: req.user.userId }).sort({ name: 1 });
    res.json(schoolTypes);
  } catch (error) {
    console.error('Error fetching school types:', error);
    res.status(500).json({ message: 'Failed to fetch school types' });
  }
});

// Create a new school type
app.post('/api/school-types', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'School type name is required' });
    }

    // Check if school type already exists for this user
    const existingSchoolType = await SchoolType.findOne({ 
      name: name.trim(), 
      userId: req.user.userId 
    });

    if (existingSchoolType) {
      return res.status(400).json({ message: 'School type already exists' });
    }

    const schoolType = await SchoolType.create({
      name: name.trim(),
      userId: req.user.userId,
    });

    res.status(201).json(schoolType);
  } catch (error) {
    console.error('Error creating school type:', error);
    res.status(500).json({ message: 'Failed to create school type' });
  }
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
