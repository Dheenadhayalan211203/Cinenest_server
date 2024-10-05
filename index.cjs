const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;
const mongouri = process.env.MONGOURI;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Middleware for setting security headers
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store'); // Prevent caching
    res.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME-sniffing
    next();
});

// Database connection
async function DbConnect() {
    try {
        await mongoose.connect(mongouri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to the Database");
    } catch (e) {
        console.error("Database connection error:", e);
    }
}
DbConnect();

// Schema definitions
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdat: { type: Date, default: Date.now },
});

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }, // Added description
    category: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // Added time
    price: { type: Number, required: true },
    availableseats: { type: Number, required: true },
    image: { type: String }, // Store image as base64 string
    createdAt: { type: Date, default: Date.now },
});

const Users = mongoose.model("users", userSchema);
const Event = mongoose.model("events", eventSchema);

// Routes
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = new Users({ name, email, password });
        await user.save();
        res.json({ signupstatus: true });
    } catch (err) {
        res.status(400).send("Error in Signing up: " + err);
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Users.findOne({ email, password });
        user ? res.json({ id: user._id }) : res.status(401).json({ status: "Login Failed" });
    } catch (e) {
        res.status(500).json({ status: "error", error: e });
    }
});

app.post('/add-event', async (req, res) => {
    try {
        const { title, description, category, location, date, time, price, availableseats, image } = req.body;
        const event = new Event({ title, description, category, location, date, time, price, availableseats, image });
        const savedEvent = await event.save();
        res.status(201).json({ status: "Event added", eventId: savedEvent._id });
    } catch (err) {
        res.status(400).send("Error in adding event: " + err);
    }
});

app.get('/all-events', async (req, res) => {
    try {
        const events = await Event.find({});
        res.json(events);
    } catch (e) {
        res.status(500).json({ status: "Error in fetching events", error: e });
    }
});

app.get('/get-event/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        res.json(event);
    } catch (e) {
        res.status(500).json({ status: "Error in fetching event", error: e });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
