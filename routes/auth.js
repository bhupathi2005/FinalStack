const express = require("express");
const router = express.Router();
const { auth, db } = require("../firebaseConfig");
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require("firebase/auth");
const {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
} = require("firebase/firestore");

// Route to render login page
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Route to render signup page
router.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

// Handle login request
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Retrieve the username from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const username = userDoc.exists() ? userDoc.data().username : "User";

    // Save user info in session
    req.session.user = { email: user.email, username: username };

    res.redirect("/dashboard");
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;

    let errorMsg = "An error occurred. Please try again.";
    if (errorCode === "auth/user-not-found") {
      errorMsg = "No user found with this email. Please sign up first.";
    } else if (errorCode === "auth/wrong-password") {
      errorMsg = "Incorrect password. Please try again.";
    } else if (errorCode === "auth/invalid-email") {
      errorMsg = "Invalid email format.";
    }

    res.status(400).render("login", { error: errorMsg });
  }
});

// Handle logout request
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Failed to destroy session:", err);
    }
    res.redirect("/login");
  });
});

// Handle signup request
router.post("/signup", async (req, res) => {
  const { email, username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res
      .status(400)
      .render("signup", { error: "Passwords do not match. Please try again." });
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      username: username,
    });

    res.redirect("/login");
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;

    let errorMsg = "Error signing up. Please try again.";
    if (errorCode === "auth/email-already-in-use") {
      errorMsg = "Email is already in use. Please log in.";
    } else if (errorCode === "auth/weak-password") {
      errorMsg = "Password should be at least 6 characters long.";
    } else if (errorCode === "auth/invalid-email") {
      errorMsg = "Invalid email format.";
    } else {
      errorMsg = `Error: ${errorMessage}`;
    }

    res.status(400).render("signup", { error: errorMsg });
  }
});

// Render the dashboard page
router.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.render("dashboard", { username: req.session.user.username });
});

// Route to render CSE PDFs and other fields
router.get("/cse", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    // Fetch the 'cse' document from the 'pdfs' collection
    const docRef = doc(db, "pdfs", "cse");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Document data:", data); // Log document data for debugging

      const pdfUrl = data.pdfUrl || null; // Access the field storing PDF URL
      const crudArray = data.crud || []; // Access the field storing CRUD array
      const nodejs = data.nodejs || []; // Access the field storing Node.js links
      const modelpaper = data.modelpaper || []; // Access the field storing Model Paper links

      // Render the cse.ejs page with the data
      res.render("cse", { pdfUrl, crudArray, nodejs, modelpaper });
    } else {
      console.log("No such document!"); // Log if the document doesn't exist
      res.render("cse", {
        pdfUrl: null,
        crudArray: [],
        nodejs: [],
        modelpaper: [],
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.render("cse", {
      pdfUrl: null,
      crudArray: [],
      nodejs: [],
      modelpaper: [],
    });
  }
});
router.get("/eee", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    // Fetch the 'cse' document from the 'pdfs' collection
    const docRef = doc(db, "pdfs", "cse");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Document data:", data); // Log document data for debugging

      const pdfUrl = data.pdfUrl || null; // Access the field storing PDF URL
      const crudArray = data.crud || []; // Access the field storing CRUD array
      const nodejs = data.nodejs || []; // Access the field storing Node.js links
      const modelpaper = data.modelpaper || []; // Access the field storing Model Paper links

      // Render the cse.ejs page with the data
      res.render("eee", { pdfUrl, crudArray, nodejs, modelpaper });
    } else {
      console.log("No such document!"); // Log if the document doesn't exist
      res.render("eee", {
        pdfUrl: null,
        crudArray: [],
        nodejs: [],
        modelpaper: [],
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.render("eee", {
      pdfUrl: null,
      crudArray: [],
      nodejs: [],
      modelpaper: [],
    });
  }
});
console.log("Firebase Auth Initialized:", auth ? "Yes" : "No");

module.exports = router;
