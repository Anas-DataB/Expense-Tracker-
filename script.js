// DOM 
const expenseForm = document.getElementById("expense-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categorySelect = document.getElementById("category");
const expenseList = document.getElementById("expense-list");
const noExpensesMessage  = document.getElementById('no-expenses');
const chartCanvas = document.getElementById("expense-chart").getContext("2d");

// Initial data setup 
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let expenseChart = null;

// Define categories with keyword for AI 
const categories={
  'Food & Drinks': ['coffee', 'restaurant', 'food', 'lunch', 'dinner', 'starbucks', 'cafe'],
  'Shopping': ['store', 'online shop', 'amazon', 'clothes', 'shoes', 'gadget'],
  'Transportation': ['gas', 'fuel', 'bus', 'train', 'uber', 'taxi'],
  'Utilities': ['rent', 'electricity', 'water', 'internet'],
  'Entertainment': ['movie', 'game', 'concert', 'ticket', 'streaming'],
  'Miscellaneous': [],
}

// --- Smart Categorization function ---
function categorizeTransaction(description){
  const lowerDescription = description.toLowerCase();
  for(const category in categories){
    if(category === 'Miscellaneous') continue;
    if (categories[category].some(keyword => lowerDescription.includes(keyword))) {
      return category ;
    }
  }
  return 'Miscellaneous';
}

// -- UI Function --
function populateCategories(){
  categorySelect.innerHTML = `<option value="">Select a category...</option>`;
  for(const category in categories){
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  }
}

function renderExpenses() {
  expenseList.innerHTML = '';
  if(expenses.length === 0){
    noExpensesMessage.style.display = "block";
  } else {
    noExpensesMessage.style.display = "none";
    expenses.forEach((expense , index) => {
      const expenseItem = document.createElement('div');
      expenseItem.className = 'expense-item';
      expenseItem.innerHTML = `
        <div class="info">
          <p class="desc">${expense.description}</p>
          <p class="cat">${expense.category}</p>
        </div>
        <div>
          <span class="amount">-₹${expense.amount.toFixed(2)}</span>
          <button data-index="${index}" class="delete-btn" title="Delete expense"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;
      expenseList.appendChild(expenseItem)
    });
    document.querySelectorAll('.delete-btn').forEach(button =>{
      button.addEventListener('click', deleteExpense)
    })
  }
}

function updateChart() {
  const categorySums = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(categorySums),
    datasets: [{
      data: Object.values(categorySums),
      backgroundColor: [
        '#3B82F6', '#EF4444', '#22C55E', '#F97316', '#8B5CF6', '#6B7280'
      ],
      hoverOffset: 4,
    }]
  };

  if (expenseChart) {
    expenseChart.data = chartData;
    expenseChart.update();
  } else {
    expenseChart = new Chart(chartCanvas, {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                if (label) {
                  const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                  const value = context.parsed;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                }
                return null;
              }
            }
          }
        }
      }
    });
  }
}

//---- Event Handlers -- 
expenseForm.addEventListener("submit",(event)=>{
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;

  if(!description || isNaN(amount) || amount <= 0 || !category){
    alert("Please enter a valid description, amount and category.");
    return;
  }

  const newExpense = {description , amount , category , date : new Date().toISOString()};
  expenses.unshift(newExpense);
  localStorage.setItem('expenses' , JSON.stringify(expenses));

  renderExpenses();
  updateChart();
  expenseForm.reset();
  categorySelect.value = '';
})

descriptionInput.addEventListener('input',(event)=>{
  const description = event.target.value.trim();
  if(description.length > 2){
    categorySelect.value = categorizeTransaction(description);
  } else {
    categorySelect.value = '';
  }
})

function deleteExpense(event){
  const index = event.currentTarget.getAttribute('data-index');
  expenses.splice(index,1);
  localStorage.setItem('expenses',JSON.stringify(expenses));
  renderExpenses();
  updateChart();
}

function init(){
  populateCategories();
  renderExpenses();
  updateChart();
}
window.addEventListener('load', init);
