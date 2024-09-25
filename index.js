const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// MongoDB URI and Database configuration
const uri = 'YOUR_MONGODB_ATLAS_URI';
const client = new MongoClient(uri);
const dbName = 'your-database-name';

// Connect to MongoDB
async function connectDB() {
    if (!client.isConnected()) {
        await client.connect();
    }
    return client.db(dbName);
}

// Register user function
exports.register = async (req, res) => {
    const db = await connectDB();
    const { name, email, password } = req.body;

    // Check if the email already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user in the database
    await db.collection('users').insertOne({ name, email, password: hashedPassword });
    return res.status(200).json({ message: 'User registered successfully' });
};

// Login user function
exports.login = async (req, res) => {
    const db = await connectDB();
    const { email, password } = req.body;

    // Find the user by email
    const user = await db.collection('users').findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json({ message: 'Login successful' });
};
