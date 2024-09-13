const express = require("express");
const path = require("path");
const session = require("express-session");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// Default route to redirect to login page
app.get("/", (req, res) => {
  res.redirect("/login"); // Redirect to the login page when accessing the root URL
});

// Use the auth routes
app.use(authRoutes);

// Route for the dashboard (Protected Route)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if not authenticated
  }

  // Render dashboard with user email from session
  res.render("dashboard", { userEmail: req.session.user });
});

// Handle errors and unknown routes
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
