console.log("script.js is loaded!");
// Define the loginUser function before it is called
 // Define the loginUser function before it is called
function loginUser(email, password) {
  console.log("Logging in with:", email, password);

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw new Error(err.error); });
    }
    return response.json();
  })
  .then(data => {                  
    console.log("Login successful:", data);
    window.location.href = "/index";  // Redirect manually
  })
  .catch(error => {
    console.error("Login error:", error.message);

    // Display error message on the page
    const errorMessage = document.getElementById("login-error");
    if (errorMessage) {
      errorMessage.textContent = error.message;
      errorMessage.style.display = "block"; // Make sure it's visible
    }
  });
}

// Wait for the DOM to load before accessing elements

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // Login Form Handling (if applicable)
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      loginUser(email, password);
    });
  }


  // Income Form Handling
  const incomeForm = document.getElementById("income-form");
  if (incomeForm) {
    incomeForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      console.log("Income form submitted!");

      // Fetch User ID from Session
      const user_id = await getUserIdFromSession();
      if (!user_id) {
        console.error("User ID not found");
        alert("Please log in to add income.");
        return;
      }

      // Get Form Data
      const category = document.getElementById("income-category").value;
      const amount = parseFloat(document.getElementById("income-amount").value);
      const source = document.getElementById("income-source").value;
      const date_received = document.getElementById("income-date").value;
      const frequency = document.getElementById("income-frequency").value;

      // Validate Form Data
      if (!category || !amount || !source || !date_received || !frequency) {
        alert("Please fill in all fields.");
        return;
      }

      // Prepare Request Body
      const requestBody = { user_id, category, amount, source, date_received, frequency };
      console.log("Request Body:", requestBody);

      // Send POST Request to Add Income
      fetch("/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Response Data:", data);
          if (data.message) {
            alert(data.message);
            loadIncome(); // Refresh the income list
          }
        })
        .catch((error) => console.error("Error adding income:", error));

      // Reset Form
      incomeForm.reset();
    });
  }

  // Load Income Data on Page Load
  loadIncome();
});

// Function to Fetch User ID from Session
async function getUserIdFromSession() {
  try {
    const response = await fetch("/auth/user");
    const data = await response.json();
    return data.user_id;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
}

// Function to Load and Display Income Data
async function loadIncome() {
  const user_id = await getUserIdFromSession();
  if (!user_id) return;

  fetch(`/income?user_id=${user_id}`)
  .then((response) => response.json())
  .then((data) => {
    console.log("Income Data:", data);

    const incomeContainer = document.getElementById("income-container");
    const totalIncomeDisplay = document.getElementById("total-income");

    if (!data.income || data.income.length === 0) {
      incomeContainer.innerHTML = "<p>No income records found.</p>";
      totalIncomeDisplay.textContent = "Total Income: Ksh 0";
      return;
    }

      let html = `<h2>Income Records</h2>`;
      data.income.forEach((item) => {
          html += `
            <li>
              <strong>${item.category}</strong> - Ksh ${item.amount} from ${item.source} <br>
              Date Received: ${item.date_received} <br>
              Frequency: ${item.frequency} <br>
              <button onclick="deleteIncome(${item.income_id})">Delete</button>
            </li>`;
        });
        html += "</ul>";

        incomeContainer.innerHTML = html;
        totalIncomeDisplay.textContent = `Total Income: Ksh ${data.total_income}`;
      })
      .catch((error) => console.error("Error loading income data:", error));
  }

// Function to Delete Income
function deleteIncome(income_id) {
  if (confirm("Are you sure you want to delete this income?")) {
    fetch(`/income/${income_id}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert(data.message);
          loadIncome(); // Refresh the income list
        }
      })
      .catch((error) => console.error("Error deleting income:", error));
  }
}

//fetching the budget data
 // Fetching the budget data
 async function fetchBudgets(category = "", timeline = "") {
  try {
    const url = `/budgets?category=${encodeURIComponent(category)}&timeline=${encodeURIComponent(timeline)}`;
    const response = await fetch(url, { credentials: "include" });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch budgets");
    }

    const budgets = await response.json();
    console.log("Fetched budgets:", budgets);

    const budgetList = document.getElementById("budgetList");
    budgetList.innerHTML = ""; // Clear existing list

    if (budgets.length === 0) {
      budgetList.innerHTML = "<p>No budgets found. Start by adding a new budget!</p>";
      return; // Exit function early
    }

    budgets.forEach((budget) => {
      const budgetItem = document.createElement("div");
      budgetItem.innerHTML = `
        <p>${budget.category} - ${budget.limit_amount} (${budget.timeline})</p>
        <button onclick="deleteBudget(${budget.budget_id})">Delete</button>
      `;
      budgetList.appendChild(budgetItem);
    });

  } catch (error) {
    console.error("Error fetching budgets:", error);
    alert(error.message);
  }
}


// Add Budget
 // Add Budget
document.getElementById("addBudgetForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const budgetData = {
    expenditure_type: document.getElementById("expenditureType").value,
    category: document.getElementById("budgetCategory").value,
    limit_amount: document.getElementById("limitAmount").value,
    timeline: document.getElementById("timeline").value
  };

  try {
    const response = await fetch("/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include cookies for session-based authentication
      body: JSON.stringify(budgetData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add budget");
    }

    const data = await response.json();
    alert(data.message);
    fetchBudgets(); // Refresh the list of budgets
  } catch (error) {
    console.error("Error adding budget:", error);
    alert(error.message);
  }
});

//delete budget
 // Delete Budget
async function deleteBudget(budget_id) {
  if (confirm("Are you sure you want to delete this budget?")) {
    try {
      const response = await fetch(`/budgets/${budget_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete budget");
      }

      const data = await response.json();
      alert(data.message);
      fetchBudgets(); // Refresh the list of budgets
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert(error.message);
    }
  }
}

// Fetch Budget Progress
 // Fetch Budget Progress
async function fetchBudgetProgress() {
  try {
    const response = await fetch("/budgets/progress", {
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch budget progress");
    }

    const progress = await response.json();
    const progressBars = document.getElementById("progressBars");

    // Clear existing content
    progressBars.innerHTML = "";

    // Populate the progress bars
    progress.forEach(p => {
      const progressPercentage = Math.min((p.total_spent / p.limit_amount) * 100, 100);
      
      let progressColor = "green";
      if (p.total_spent > p.limit_amount) {
        progressColor = "red";
      } else if (p.total_spent >= 0.8 * p.limit_amount) {
        progressColor = "yellow";
      }

      progressBars.innerHTML += `
        <div>
          <h4>${p.category} (${p.timeline})</h4>
          <div class="progress-bar">
            <div class="progress" style="width: ${progressPercentage}%; background-color: ${progressColor};"></div>
          </div>
          <p>Spent: ksh${p.total_spent} / Limit: ksh${p.limit_amount}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error fetching budget progress:", error);
    alert(error.message);
  }
}


// Populate Category Dropdown
 // Populate Category Dropdown
async function populateCategoryDropdown() {
  const type = document.getElementById("transactionexpenditure").value;

  if (!type) {
    console.warn("Transaction type is empty, cannot fetch categories.");
    return;
  }

  try {
    const response = await fetch(`/budgets/categories?type=${encodeURIComponent(type)}`, {
      credentials: "include", // Ensure cookies are sent for authentication
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch budget categories");
    }

    const categories = await response.json();
    const categoryDropdown = document.getElementById("transactionCategory");

    // Clear existing options
    categoryDropdown.innerHTML = "<option value=''>Select Category</option>";

    // Ensure the response is an array
    if (!Array.isArray(categories) || categories.length === 0) {
      console.warn("No categories returned from the server.");
      return;
    }

    // Populate dropdown with categories
    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching budget categories:", error);
    alert(error.message);
  }
}

// Trigger category population when the expenditure type changes
document.getElementById("transactionexpenditure").addEventListener("change", populateCategoryDropdown);


// Add Transaction
document.getElementById("addTransactionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const transaction = {
    type: document.getElementById("transactionexpenditure").value,
    category: document.getElementById("transactionCategory").value,
    amount: parseFloat(document.getElementById("amount").value),
    description: document.getElementById("description").value,
    transaction_date: document.getElementById("transactionDate").value,
    frequency: document.getElementById("frequency").value
  };

  try {
    const response = await fetch("/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include cookies for session-based authentication
      body: JSON.stringify(transaction)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add transaction");
    }

    const result = await response.json();
    alert(result.message);
    fetchTransactions(); // Refresh the list of transactions
    fetchBudgetProgress(); // Refresh budget progress
    loadFinanceSummary(); // ✅ Refresh finance summary immediately
  } catch (error) {
    console.error("Error adding transaction:", error);
    alert(error.message);
  }
});

// Fetch and Display Transactions
 // Fetch and Display Transactions
async function fetchTransactions() {
  try {
    const response = await fetch("/transactions", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const transactions = await response.json();
    const transactionsTableBody = document.getElementById("transactionsTableBody");
    transactionsTableBody.innerHTML = ""; // Clear table before populating

    for (let t of transactions) {
      // Fetch budget for the same category and frequency
      let budgetLimit = 0;
      let totalSpent = 0;

      try {
        const budgetResponse = await fetch(`/budgets?category=${t.category}&frequency=${t.frequency}`, { 
          credentials: "include" 
        });

        if (budgetResponse.ok) {
          const budgetData = await budgetResponse.json();
          budgetLimit = budgetData.limit_amount;
          totalSpent = budgetData.total_spent;
        }
      } catch (error) {
        console.error("Error fetching budget data:", error);
      }

      // Check if transaction exceeds budget
      const remainingBudget = budgetLimit - totalSpent;
      const isOverBudget = t.amount > remainingBudget && budgetLimit > 0;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(t.transaction_date).toLocaleDateString()}</td>
        <td>${t.type}</td>
        <td>${t.category}</td>
        <td style="color: ${isOverBudget ? 'red' : 'black'};">ksh${t.amount.toFixed(2)}</td>
        <td>${t.description}</td>
        <td>${t.frequency}</td>
      `;
      transactionsTableBody.appendChild(row);
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    alert(error.message);
  }
}


// Financial Summary
  // Financial Summary
  async function loadFinanceSummary() {
    try {
      const response = await fetch("/finance-summary", {
        credentials: "include", // Include cookies for session-based authentication
      });
  
      console.log("API Response Status:", response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.message || "Failed to fetch finance summary");
      }
  
      const data = await response.json();
      console.log("Finance Summary Data:", data);
  
      if (!data) {
        throw new Error("Empty response from server");
      }
  
      const totalIncome = data.total_income || 0;
      const totalExpense = data.total_expense || 0;
      const remaining = data.remaining_balance || 0;
  
      const expenses = data.total_expenses || 0;
      const bills = data.total_bills || 0;
      const debts = data.total_debts || 0;
      const savings = data.total_savings || 0;
  
      console.log("Total Income:", totalIncome);
      console.log("Total Expense:", totalExpense);
      console.log("Remaining Balance:", remaining);
      console.log("Expenses Breakdown:", { expenses, bills, debts, savings });
  
      // Check if chart elements exist
      const financeCanvas = document.getElementById("financeChart");
      const expenditureCanvas = document.getElementById("expenditureChart");
  
      if (!financeCanvas || !expenditureCanvas) {
        throw new Error("Chart elements are missing in HTML");
      }
  
      const financeCtx = financeCanvas.getContext("2d");
      new Chart(financeCtx, {
        type: "pie",
        data: {
          labels: ["Total Income", "Total Expense", "Remaining Balance"],
          datasets: [{
            data: [totalIncome, totalExpense, remaining],
            backgroundColor: ["green", "red", "blue"]
          }]
        }
      });
  
      const expenditureCtx = expenditureCanvas.getContext("2d");
      new Chart(expenditureCtx, {
        type: "doughnut",
        data: {
          labels: ["Expenses", "Bills", "Debts", "Savings"],
          datasets: [{
            data: [expenses, bills, debts, savings],
            backgroundColor: ["orange", "purple", "brown", "cyan"]
          }]
        }
      });
  
    } catch (error) {
      console.error("Error loading finance summary:", error);
      alert(error.message);
    }
  }
  



// Auto-fetch data on page load
document.addEventListener("DOMContentLoaded", async function () {
  const user_id = await getUserIdFromSession();
  if (!user_id) return;

  loadIncome();
  fetchBudgets();
  fetchBudgetProgress();
  fetchTransactions();
  loadFinanceSummary();
});

let showAll = false;
const defaultDisplayCount = 5;
let transactions = []; // Empty initially, will be populated from the server

async function fetchTransactions() {
  try {
    const response = await fetch("/transactions", { credentials: "include" });

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    transactions = await response.json(); // Store fetched transactions
    displayTransactions(); // Update UI with real transactions
  } catch (error) {
    console.error("Error fetching transactions:", error);
    alert(error.message);
  }
}

function displayTransactions() {
  const tbody = document.getElementById("transactionsTableBody");
  tbody.innerHTML = ""; // Clear previous data

  const displayItems = showAll ? transactions : transactions.slice(0, defaultDisplayCount);

  displayItems.forEach(t => {
    const row = `<tr>
                  <td>${new Date(t.transaction_date).toLocaleDateString()}</td>
                  <td>${t.type}</td>
                  <td>${t.category}</td>
                  <td>ksh${t.amount.toFixed(2)}</td>
                  <td>${t.description}</td>
                  <td>${t.frequency}</td>
                </tr>`;
    tbody.innerHTML += row;
  });

  // Toggle buttons based on state
  document.getElementById("showMoreBtn").style.display = showAll ? "none" : "block";
  document.getElementById("showLessBtn").style.display = showAll ? "block" : "none";
}

function toggleTransactions() {
  showAll = !showAll;
  displayTransactions();
}

// Fetch real transactions when the page loads
fetchTransactions();



// Dark Mode
document.getElementById("toggle-theme").addEventListener("click", function() {
  document.body.classList.toggle("dark-mode");
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}
