const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cors=require('cors')
 
 
const app = express();
const port = 3000;

app.use(cors())

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

 

const mongouri=process.env.MONGOURI;

async function DbConnect() {
  try {
    await mongoose
      .connect(
        mongouri,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      )
      .then(() => {
        console.log("connected to the Database");
      });
  } catch (e) {
    console.log(e);
  }
}

DbConnect();

const user = new mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, required: true },
  createdat: { type: Date, default: Date.now },
});

const Users = mongoose.model("users", user);

const event = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  price: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  image: { type: String },  // Store image as binary data
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model("events", event);



app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const user = new Users({ name, email, password });
  await user
    .save()
    .then(() => {
      res.send({ signupstatus: true });
    })
    .catch((err) => {
      res.send("Error in Signing in " + err);
    });
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email, password });
    user ? res.send({ "id": user._id }) : res.send({ "status": "Login Failed" });
  } catch {
    res.send({ "status": "error" });
  }
});

// Route to handle adding an event with an image
app.post('/add-event',  async (req , res) => {
  try {
    const { title, description, category, location, date, time, price, availableSeats ,image } = req.body;
    

    const event = new Event({
      title,
      description,
      category,
      location,
      date,
      time,
      price,
      availableSeats,
      image
       
    });

    const savedEvent = await event.save();
    res.status(201).send({"status":"Event added","event id :":savedEvent._id});
  } catch (err) {
    res.status(400).send("Error in adding event: " + err);
  }
});

app.get('/all-events',async(req,res)=>
{
      {
            try
            {
                   const events=await Event.find({});
                   res.json(events);
            }

            catch(e){
                  res.send({"status":"Error in finding the events " + e})
            }
      }
})

app.get('/get-event/:id', async (req, res) => {
      try {
        const event = await Event.findById(req.params.id); 
        if (event) { // Check if event was found
          res.json(event); 
        } else {
          res.status(404).send("Event not found");
        }
      } catch (e) {
        res.status(500).send("Error fetching event: " + e); 
      }
    });

    app.post("/")

app.listen(port, () => {
  console.log(`Listening on :  ${port}`);
});
