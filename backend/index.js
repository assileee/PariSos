const express = require("express");
const app = express();
const port = 4000;

require("dotenv").config();
const connectDB = require("./utils/db.js");
const path = require("path");

const userRoutes = require("./routes/users");
const chatbotRoutes = require("./routes/chatbot");

// Connect to DBs
connectDB();

// MIDDLEWARE
app.use(express.json());

// --- CORS MIDDLEWARE ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
app.options("*", (req, res) => {
  res.sendStatus(200);
});

// Extra middleware
app.use((req, res, next) => {
  req.requestTime = Date.now();
  req.arithmetical_value = 4 * 7;
  next();
});

// ROUTES
app.use("/api/users", userRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Root & static
app.get("/", (req, res) => {
  res.send("Welcome to PariSos - Your Paris Student Assistant!");
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/debug/routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`PariSos server running on port ${port}`);
  console.log(`Ollama integration: ${process.env.USE_OLLAMA === 'true' ? 'Enabled' : 'Mock mode'}`);
});