const express = require("express");
const axios = require("axios");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");

require("dotenv").config();//load api key from .env file
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


//openai api route(chatbot)
app.post("/openai", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ message: "Message is required" });
  }
  try{
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
        max_tokens: 100,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error: "Failed to get response from chatbot" });
  }
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
      (err, result) => {
        if (err) return res.status(500).send("Error registering user");

        // Automatically log in the user after registration
        req.session.user = {
          id: result.insertId,  // Get the new user's ID
          email: email,
          name: full_name
        };

        console.log("User registered and logged in:", req.session.user);

        res.redirect("/index"); // Now the user has a session and can access /index
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
    
    // ✅ Send JSON instead of redirecting
    res.json({ message: "Login successful", user: req.session.user });
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
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.redirect("/login"); // Redirect to login page after logout
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

 

app.get("/chat", (req, res) => {
  res.render("chat");
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
 // Fetch Income Data and Total Income
app.get("/income", authenticateSession, (req, res) => {
  const user_id = req.session.user.id;

  const incomeQuery = "SELECT income_id, category, amount, source, date_received, frequency FROM income WHERE user_id = ?";
  const totalIncomeQuery = "SELECT SUM(amount) AS total_income FROM income WHERE user_id = ?";

  db.query(incomeQuery, [user_id], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Error fetching income data" });
    }

    db.query(totalIncomeQuery, [user_id], (err, totalResult) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Error calculating total income" });
      }

      const totalIncome = totalResult[0].total_income || 0; // If no income, default to 0
      res.json({ income: results, total_income: totalIncome });
    });
  });
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
 // Fetch Budget by Category and Frequency
  // Fetch Budgets
  app.get("/budgets", authenticateSession, (req, res) => {
    let { category, timeline } = req.query;
    const user_id = req.session.user.id;
  
    // Ensure undefined values are handled
    category = category || "";
    timeline = timeline || "";
  
    console.log("Fetching budgets for user:", user_id);
    console.log("Received query params:", { category, timeline });
  
    let sql = `
      SELECT 
        b.budget_id,
        b.category,
        b.expenditure_type,
        b.timeline,
        b.limit_amount,
        (
          SELECT IFNULL(SUM(t.amount), 0) 
          FROM transactions t 
          WHERE t.user_id = b.user_id 
            AND t.category = b.category 
            AND t.type = b.expenditure_type
        ) AS total_spent
      FROM budgets b
      WHERE b.user_id = ?
    `;
  
    let params = [user_id];
  
    if (category && timeline) {
      sql += ` AND b.category = ? AND b.timeline = ?`;
      params.push(category, timeline);
    }
  
    console.log("Executing SQL:", sql, "with params:", params);
  
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ message: "Failed to fetch budget data" });
      }
      res.json(results);
    });
  });
  



 // Add Budget
  // Add Budget
app.post("/budgets", authenticateSession, (req, res) => {
  const { expenditure_type, category, limit_amount, timeline } = req.body;
  const user_id = req.session.user?.id;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  if (!category || !limit_amount || !timeline || !expenditure_type) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `
    INSERT INTO budgets (user_id, expenditure_type, category, limit_amount, timeline)
    VALUES (?, ?, ?, ?, ?);
  `;

  db.query(sql, [user_id, expenditure_type, category, limit_amount, timeline], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to add budget" });
    }
    res.json({ message: "Budget added successfully", budget_id: result.insertId });
  });
});

 // Delete Budget
 // Delete Budget
app.delete("/budgets/:budget_id", authenticateSession, (req, res) => {
  const { budget_id } = req.params;
  const user_id = req.session.user?.id;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  db.query(
    "DELETE FROM budgets WHERE budget_id = ? AND user_id = ?",
    [budget_id, user_id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to delete budget" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Budget not found or unauthorized" });
      }

      res.json({ message: "Budget deleted successfully" });
    }
  );
});


//budget progress
// Fetch Budget Progress
 // Fetch Budget Progress
app.get("/budgets/progress", authenticateSession, (req, res) => {
  const user_id = req.session.user.id;

  const sql = `
    SELECT 
      b.budget_id,
      b.category, 
      b.timeline, 
      b.limit_amount, 
      (
        SELECT IFNULL(SUM(t.amount), 0) 
        FROM transactions t 
        WHERE t.user_id = b.user_id 
          AND t.category = b.category 
          AND t.type = b.expenditure_type
      ) AS total_spent
    FROM budgets b
    WHERE b.user_id = ?;
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch budget progress" });
    }
    res.json(results);
  });
});


 // Fetch Budget Categories for a User (Filtered by Type)
 // Fetch Budget Categories for a User (Filtered by Type)
app.get("/budgets/categories", authenticateSession, (req, res) => {
  const user_id = req.session.user.id;
  const { type } = req.query;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized request" });
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

    if (!results.length) {
      return res.status(404).json({ message: "No categories found for this type" });
    }

    // Ensure category values are returned as an array
    const categories = results.map(row => row.category);
    res.json(categories);
  });
});


 // ======== ADD TRANSACTION WITH BUDGET CHECK =========
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

    let budgetLimit = 0;
    let timeline = frequency;
    if (budgetResult.length > 0) {
      budgetLimit = budgetResult[0].limit_amount;
      timeline = budgetResult[0].timeline;
    }

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

      const totalSpent = spendingResult[0]?.total_spent || 0;
      const remainingBudget = budgetLimit - totalSpent;
      const isOverBudget = amount > remainingBudget && budgetLimit > 0; // If budget is 0, don't consider over-budget

      // Step 3: Save the transaction in the database
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
          transaction_id: result.insertId,
          is_over_budget: isOverBudget, 
          remainingBudget: remainingBudget
        });
      });
    });
  });
});

// ======== FETCH TRANSACTIONS FOR A USER =========
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


 

// ======== FINANCE SUMMARY =========
  // Fetch Finance Summary for a User
app.get("/finance-summary", authenticateSession, (req, res) => {
  const user_id = req.session.user.id; // Get user_id from the session

  const query = `
    SELECT 
      (SELECT COALESCE(SUM(amount), 0) FROM income WHERE user_id = ?) AS total_income, 
      (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = ? 
        AND type IN ('expense', 'bill', 'debt', 'savings')) AS total_expense, 
      (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = ? AND type = 'expense') AS total_expenses,
      (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = ? AND type = 'bill') AS total_bills,
      (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = ? AND type = 'debt') AS total_debts,
      (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = ? AND type = 'savings') AS total_savings
  `;

  db.query(query, [user_id, user_id, user_id, user_id, user_id, user_id], (err, results) => {
    if (err) {
      console.error("Error fetching finance summary:", err);
      return res.status(500).json({ message: "Failed to fetch finance summary. Please try again later." });
    }

    const summary = results[0];
    summary.remaining_balance = summary.total_income - summary.total_expense; // Calculate remaining balance

    res.json(summary);
  });
});


// Fetch Notifications
app.get("/notifications", authenticateSession, (req, res) => {
  const user_id = req.session.user.id; // Fix: Ensure user_id is correctly accessed

  db.query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
    [user_id], // Use the correct variable
    (err, results) => {
      if (err) throw err;
      res.render("notifications", { notifications: results });
    }
  );
});


// Fetch Settings
app.get("/settings", authenticateSession, (req, res) => {
  const user_id = req.session.user.id; // Fix: Ensure user_id is correctly accessed

  db.query(
    "SELECT * FROM settings WHERE user_id = ?",
    [user_id], // Fix: Ensure correct session reference
    (err, results) => {
      if (err) throw err;

      if (results.length === 0) {
        // Insert default settings for the user if none exist
        db.query(
          "INSERT INTO settings (user_id, theme, notifications_enabled) VALUES (?, 'light', TRUE)",
          [user_id], // Fix: Ensure correct user_id is used
          (insertErr) => {
            if (insertErr) throw insertErr;

            res.redirect("/settings"); // Reload the page after inserting defaults
          }
        );
      } else {
        res.render("settings", { settings: results[0] });
      }
    }
  );
});



// Update Settings
app.post("/settings", authenticateSession, (req, res) => {
  const { theme, notifications_enabled } = req.body;
  const user_id = req.session.user.id; // Fix: Ensure correct session reference

  db.query(
    "UPDATE settings SET theme = ?, notifications_enabled = ? WHERE user_id = ?",
    [theme, notifications_enabled === "on", user_id], // Fix: Ensure correct user_id is used
    (err) => {
      if (err) throw err;
      res.redirect("/settings");
    }
  );
});



app.get("/terms",  (req, res) => {
  res.render("terms");
});
app.get("/policy",  (req, res) => {
  res.render("policy");
});
app.get("/support",  (req, res) => {
  res.render("support");
});
app.get("/faqs",  (req, res) => {
  res.render("faqs");
});



// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});