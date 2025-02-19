const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();
const port = 3000;

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(
  session({
    secret: "your_secret_key", // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
  })
);
 
// Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "spendwise",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL Database");
});

// Middleware to check authentication using session
const authenticateSession = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized: Please log in" });
  }
  next();
};

// Home Route (Accessible by Everyone)
app.get("/", (req, res) => {
  res.render("home"); // This is the public page
});

// Register Routes
app.get("/register", (req, res) => {
  res.render("register", { message: null });
});

app.post("/register", async (req, res) => {
  const { full_name, email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, existingUser) => {
    if (err) return res.status(500).send("Database error");
    if (existingUser.length > 0) {
      return res.render("register", { message: "User already exists. Please log in." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
      [full_name, email, hashedPassword],
      (err) => {
        if (err) return res.status(500).send("Error registering user");
        res.redirect("/login");
      }
    );
  });
});

// Login Routes
app.get("/login", (req, res) => {
  res.render("login", { message: null });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) return res.status(401).json({ error: "Invalid email or password" });

    // Set session data
    req.session.user = { id: user.user_id, email: user.email, name: user.full_name };

    console.log("User logged in:", req.session.user);
    res.redirect("/index"); // Redirect to the index page after successful login
  });
});

// Endpoint to check session and return user ID
app.get("/auth/user", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  res.json({ user_id: req.session.user.id });
});

// Logout Route
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// Protected Index Page (Only for Authenticated Users)
app.get("/index", authenticateSession, (req, res) => {
  res.render("index", { user: req.session.user });
});

// Route for Savings Page (protected route)
app.get("/savings", authenticateSession, (req, res) => {
  res.render("savings");
});

// Route for Debts Page (protected route)
app.get("/debts", authenticateSession, (req, res) => {
  res.render("debts");
});

// Get Logged-in User's ID from Session
app.get("/session-user", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  res.json({ user_id: req.session.user.id }); // Return user ID from session
});

 



 // ======== INCOME ROUTES =========

 // Add Income
app.post("/income", authenticateSession, (req, res) => {
  const { user_id, category, amount, source, date_received, frequency } = req.body;
  if (!category || !amount || !source || !date_received || !frequency) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql =
    "INSERT INTO income (user_id, category, amount, source, date_received, frequency) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [user_id, category, amount, source, date_received, frequency],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Error adding income" });
      }
      res.json({ message: "Income added successfully", income_id: result.insertId });
    }
  );
});

// Fetch Income Data
app.get("/income", authenticateSession, (req, res) => {
  const user_id = req.session.user.id;
  db.query(
    "SELECT income_id, category, amount, source, date_received, frequency FROM income WHERE user_id = ?",
    [user_id],
    (err, results) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Error fetching income data" });
      }
      res.json(results);
    }
  );
});

// Delete Income
app.delete("/income/:id", authenticateSession, (req, res) => {
  const income_id = req.params.id;
  const user_id = req.session.user.id;
  db.query(
    "DELETE FROM income WHERE income_id = ? AND user_id = ?",
    [income_id, user_id],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Error deleting income" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Income not found" });
      }
      res.json({ message: "Income deleted successfully" });
    }
  );
});



// ======== BUDGET ROUTES =========
 // Fetch Budgets
app.get("/budgets", authenticateSession, (req, res) => {
  const user_id = req.session.user.id; // Get user_id from the session
  db.query(
    "SELECT * FROM budgets WHERE user_id = ? ORDER BY category",
    [user_id], // Use the session user_id
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch budgets" });
      }
      res.json(results);
    }
  );
});

 // Add Budget
app.post("/budgets", authenticateSession, (req, res) => {
  const { expenditure_type, category, limit_amount, timeline } = req.body;

  // Validate required fields
  if (!expenditure_type || !category || !limit_amount || !timeline) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user_id = req.session.user.id; // Get user_id from the session

  const sql =
    "INSERT INTO budgets (user_id, expenditure_type, category, limit_amount, timeline) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [user_id, expenditure_type, category, limit_amount, timeline],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to add budget" });
      }
      res.json({ message: "Budget added successfully", budget_id: result.insertId });
    }
  );
});
 // Delete Budget
app.delete("/budgets/:id", authenticateSession, (req, res) => {
  const budget_id = req.params.id; // Get the budget ID from the URL
  const user_id = req.session.user.id; // Get user_id from the session

  db.query(
    "DELETE FROM budgets WHERE budget_id = ? AND user_id = ?",
    [budget_id, user_id], // Use the session user_id
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to delete budget" });
      }

      // Check if any rows were affected
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Budget not found or you do not have permission to delete it" });
      }

      res.json({ message: "Budget deleted successfully" });
    }
  );
});

 // Fetch Budget Categories for a User (Filtered by Type)
app.get("/budgets/categories", authenticateSession, (req, res) => {
  const user_id = req.session.user.id; // Get user_id from the session
  const { type } = req.query; // Get the type from query parameters

  // Validate type (if provided)
  if (type && typeof type !== "string") {
    return res.status(400).json({ message: "Invalid type parameter" });
  }

  let query = "SELECT DISTINCT category FROM budgets WHERE user_id = ?";
  const params = [user_id];

  if (type) {
    query += " AND expenditure_type = ?";
    params.push(type);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching budget categories:", err);
      return res.status(500).json({ message: "Failed to fetch budget categories" });
    }
    res.json(results.map(r => r.category)); // Return only category names
  });
});

// ======== ADD TRANSACTION WITH BUDGET CHECK =========
 // Add Transaction with Budget Check
app.post("/transactions", authenticateSession, (req, res) => {
  const { type, category, amount, description, transaction_date, frequency } = req.body;
  const user_id = req.session.user.id; // Get user_id from the session

  // Validate required fields
  if (!type || !category || !amount || !description || !transaction_date || !frequency) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate amount (must be a positive number)
  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }

  // Step 1: Check if a budget exists for the specified category
  const budgetQuery = `
    SELECT limit_amount, timeline 
    FROM budgets 
    WHERE user_id = ? AND category = ? AND timeline = ?
  `;
  const budgetParams = [user_id, category, frequency];

  db.query(budgetQuery, budgetParams, (err, budgetResult) => {
    if (err) {
      console.error("Error fetching budget:", err);
      return res.status(500).json({ message: "Failed to fetch budget" });
    }

    if (budgetResult.length === 0) {
      return res.status(400).json({ message: "No budget set for this category and timeline" });
    }

    const budgetLimit = budgetResult[0].limit_amount;
    const timeline = budgetResult[0].timeline;

    // Step 2: Calculate total spending for the category within the budget timeline
    let spendingQuery = `
      SELECT SUM(amount) AS total_spent 
      FROM transactions 
      WHERE user_id = ? AND category = ? 
    `;
    const spendingParams = [user_id, category];

    // Add timeline-specific filters
    switch (timeline) {
      case "weekly":
        spendingQuery += " AND transaction_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
        break;
      case "monthly":
        spendingQuery += " AND transaction_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
        break;
      case "annually":
        spendingQuery += " AND transaction_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
        break;
      case "one-time":
        spendingQuery += " AND transaction_date >= (SELECT created_at FROM budgets WHERE user_id = ? AND category = ? LIMIT 1)";
        spendingParams.push(user_id, category);
        break;
    }

    db.query(spendingQuery, spendingParams, (err, spendingResult) => {
      if (err) {
        console.error("Error fetching spending:", err);
        return res.status(500).json({ message: "Failed to fetch spending" });
      }

      const totalSpent = spendingResult[0].total_spent || 0;
      const remainingBudget = budgetLimit - totalSpent;

      // Step 3: Check if the transaction exceeds the budget
      if (amount > remainingBudget) {
        return res.status(400).json({ 
          message: `Transaction exceeds budget for category ${category}`,
          remainingBudget: remainingBudget
        });
      }

      // Step 4: Save the transaction in the database
      const transactionQuery = `
        INSERT INTO transactions (user_id, type, category, amount, description, transaction_date, frequency)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const transactionParams = [user_id, type, category, amount, description, transaction_date, frequency];

      db.query(transactionQuery, transactionParams, (err, result) => {
        if (err) {
          console.error("Error adding transaction:", err);
          return res.status(500).json({ message: "Failed to add transaction" });
        }
        res.json({ 
          message: "Transaction added successfully", 
          transaction_id: result.insertId 
        });
      });
    });
  });
});

// ======== FETCH TRANSACTIONS FOR A USER =========
 // Fetch Transactions for a User
app.get("/transactions", authenticateSession, (req, res) => {
  const user_id = req.session.user.id; // Get user_id from the session

  db.query(
    "SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC",
    [user_id],
    (err, results) => {
      if (err) {
        console.error("Error fetching transactions:", err);
        return res.status(500).json({ message: "Failed to fetch transactions. Please try again later." });
      }
      res.json(results);
    }
  );
});

// ======== FETCH BUDGET PROGRESS =========
 // Fetch Budget Progress for a User
app.get("/budgets/progress", authenticateSession, (req, res) => {
  const user_id = req.session.user.id; // Get user_id from the session

  const query = `
    SELECT b.category, b.limit_amount, b.timeline, COALESCE(SUM(t.amount), 0) AS total_spent
    FROM budgets b
    LEFT JOIN transactions t 
      ON b.user_id = t.user_id 
      AND b.category = t.category
      AND (
        (b.timeline = 'daily' AND t.transaction_date >= CURDATE()) OR
        (b.timeline = 'weekly' AND t.transaction_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK)) OR
        (b.timeline = 'monthly' AND t.transaction_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)) OR
        (b.timeline = 'annually' AND t.transaction_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)) OR
        (b.timeline = 'one-time' AND t.transaction_date >= b.created_at)
      )
    WHERE b.user_id = ?
    GROUP BY b.category, b.limit_amount, b.timeline
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching budget progress:", err);
      return res.status(500).json({ message: "Failed to fetch budget progress. Please try again later." });
    }
    res.json(results);
  });
});

// ======== FINANCE SUMMARY =========
 // Fetch Finance Summary for a User
app.get("/finance-summary", authenticateSession, (req, res) => {
  const user_id = req.session.user.id; // Get user_id from the session

  const query = `
    SELECT 
      (SELECT SUM(amount) FROM income WHERE user_id = ?) AS total_income, 
      (SELECT SUM(amount) FROM transactions WHERE user_id = ?) AS total_expense
  `;

  db.query(query, [user_id, user_id], (err, results) => {
    if (err) {
      console.error("Error fetching finance summary:", err);
      return res.status(500).json({ message: "Failed to fetch finance summary. Please try again later." });
    }
    res.json(results[0]);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});