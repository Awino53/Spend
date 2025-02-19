console.log("script.js is loaded!");

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
      if (!data || data.message) {
        incomeContainer.innerHTML = "<p>No income records found.</p>";
        return;
      }

      let html = `<h2>Income Records</h2>`;
      if (data.length === 0) {
        html += "<p>No income records found.</p>";
      } else {
        html += "<ul>";
        data.forEach((item) => {
          html += `
            <li>
              <strong>${item.category}</strong> - Ksh ${item.amount} from ${item.source} <br>
              Date Received: ${item.date_received} <br>
              Frequency: ${item.frequency} <br>
              <button onclick="deleteIncome(${item.income_id})">Delete</button>
            </li>`;
        });
        html += "</ul>";
      }
      incomeContainer.innerHTML = html;
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
async function fetchBudgets() {
  try {
    const response = await fetch("/budgets", {
      credentials: "include", // Include cookies for session-based authentication
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch budgets");
    }
    const budgets = await response.json();
    console.log("Budgets:", budgets);
    // Display budgets in the UI
  } catch (error) {
    console.error("Error fetching budgets:", error);
    alert(error.message);
  }
}
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
async function deleteBudget(budget_id) {
  if (confirm("Are you sure you want to delete this budget?")) {
    try {
      const response = await fetch(`/budgets/${budget_id}`, {
        method: "DELETE",
        credentials: "include", // Include cookies for session-based authentication
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
async function fetchBudgetProgress() {
  try {
    const response = await fetch("/budgets/progress", {
      credentials: "include", // Include cookies for session-based authentication
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
      const progressPercentage = (p.total_spent / p.limit_amount) * 100;
      const progressColor = p.total_spent > p.limit_amount ? "red" : "green";

      progressBars.innerHTML += `
        <div>
          <h4>${p.category} (${p.timeline})</h4>
          <div class="progress-bar">
            <div class="progress" style="width: ${progressPercentage}%; background-color: ${progressColor};"></div>
          </div>
          <p>Spent: $${p.total_spent} / Limit: $${p.limit_amount}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error fetching budget progress:", error);
    alert(error.message);
  }
}

// Populate Category Dropdown
async function populateCategoryDropdown() {
  const type = document.getElementById("transactionexpenditure").value;

  try {
    const response = await fetch(`/budgets/categories?type=${type}`, {
      credentials: "include", // Include cookies for session-based authentication
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch budget categories");
    }

    const categories = await response.json();
    const categoryDropdown = document.getElementById("transactionCategory");

    // Clear existing options
    categoryDropdown.innerHTML = "<option value=''>Select Category</option>";

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
  } catch (error) {
    console.error("Error adding transaction:", error);
    alert(error.message);
  }
});

// Fetch and Display Transactions
async function fetchTransactions() {
  try {
    const response = await fetch("/transactions", {
      credentials: "include", // Include cookies for session-based authentication
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch transactions");
    }

    const transactions = await response.json();
    const transactionsTableBody = document.getElementById("transactionsTableBody");

    // Clear existing rows
    transactionsTableBody.innerHTML = "";

    // Populate the table with transactions
    transactions.forEach(t => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(t.transaction_date).toLocaleDateString()}</td>
        <td>${t.type}</td>
        <td>${t.category}</td>
        <td>$${t.amount}</td>
        <td>${t.description}</td>
        <td>${t.frequency}</td>
      `;
      transactionsTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    alert(error.message);
  }
}

// Financial Summary
async function loadFinanceSummary() {
  try {
    const response = await fetch("/finance-summary", {
      credentials: "include", // Include cookies for session-based authentication
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch finance summary");
    }

    const data = await response.json();
    const totalIncome = data.total_income || 0;
    const totalExpense = data.total_expense || 0;
    const remaining = totalIncome - totalExpense;

    // Render the finance summary (e.g., using a chart library)
    const ctx = document.getElementById("financeChart").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Total Income", "Total Expense", "Remaining Balance"],
        datasets: [{
          data: [totalIncome, totalExpense, remaining],
          backgroundColor: ["green", "red", "blue"]
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
