const display = document.querySelector("#display");
const historyDisplay = document.querySelector("#history");
const keypad = document.querySelector(".keypad");

const calculator = {
  displayValue: "0",
  firstOperand: null,
  operator: null,
  waitingForSecondOperand: false,
};

const operatorLabels = {
  "/": "÷",
  "*": "×",
  "-": "−",
  "+": "+",
};

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  const text = Number.parseFloat(value.toPrecision(12)).toString();
  return text.length > 14 ? value.toExponential(8) : text;
}

function inputDigit(digit) {
  const { displayValue, waitingForSecondOperand } = calculator;

  if (waitingForSecondOperand) {
    calculator.displayValue = digit;
    calculator.waitingForSecondOperand = false;
    return;
  }

  calculator.displayValue = displayValue === "0" ? digit : displayValue + digit;
}

function inputDecimal() {
  if (calculator.waitingForSecondOperand) {
    calculator.displayValue = "0.";
    calculator.waitingForSecondOperand = false;
    return;
  }

  if (!calculator.displayValue.includes(".")) {
    calculator.displayValue += ".";
  }
}

function clearCalculator() {
  calculator.displayValue = "0";
  calculator.firstOperand = null;
  calculator.operator = null;
  calculator.waitingForSecondOperand = false;
}

function deleteDigit() {
  if (calculator.waitingForSecondOperand) {
    return;
  }

  calculator.displayValue =
    calculator.displayValue.length > 1 ? calculator.displayValue.slice(0, -1) : "0";
}

function applyPercent() {
  const currentValue = Number.parseFloat(calculator.displayValue);
  calculator.displayValue = formatNumber(currentValue / 100);
}

function calculate(firstOperand, secondOperand, operator) {
  if (operator === "+") return firstOperand + secondOperand;
  if (operator === "-") return firstOperand - secondOperand;
  if (operator === "*") return firstOperand * secondOperand;
  if (operator === "/") return secondOperand === 0 ? Number.NaN : firstOperand / secondOperand;
  return secondOperand;
}

function handleOperator(nextOperator) {
  const inputValue = Number.parseFloat(calculator.displayValue);

  if (calculator.operator && calculator.waitingForSecondOperand) {
    calculator.operator = nextOperator;
    updateDisplay();
    return;
  }

  if (calculator.firstOperand === null) {
    calculator.firstOperand = inputValue;
  } else if (calculator.operator) {
    const result = calculate(calculator.firstOperand, inputValue, calculator.operator);
    calculator.displayValue = formatNumber(result);
    calculator.firstOperand = result;
  }

  calculator.waitingForSecondOperand = true;
  calculator.operator = nextOperator;
}

function performEquals() {
  if (!calculator.operator || calculator.firstOperand === null) {
    return;
  }

  const secondOperand = Number.parseFloat(calculator.displayValue);
  const result = calculate(calculator.firstOperand, secondOperand, calculator.operator);

  calculator.displayValue = formatNumber(result);
  calculator.firstOperand = null;
  calculator.operator = null;
  calculator.waitingForSecondOperand = true;
}

function updateDisplay() {
  display.textContent = calculator.displayValue;

  if (calculator.operator && calculator.firstOperand !== null) {
    historyDisplay.textContent = `${formatNumber(calculator.firstOperand)} ${
      operatorLabels[calculator.operator]
    }`;
  } else {
    historyDisplay.innerHTML = "&nbsp;";
  }
}

function flashKey(selector) {
  const key = document.querySelector(selector);
  if (!key) return;

  key.classList.add("is-pressed");
  window.setTimeout(() => key.classList.remove("is-pressed"), 120);
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number) {
    inputDigit(button.dataset.number);
  } else if (button.dataset.operator) {
    handleOperator(button.dataset.operator);
  } else if (button.dataset.action === "decimal") {
    inputDecimal();
  } else if (button.dataset.action === "clear") {
    clearCalculator();
  } else if (button.dataset.action === "delete") {
    deleteDigit();
  } else if (button.dataset.action === "percent") {
    applyPercent();
  } else if (button.dataset.action === "equals") {
    performEquals();
  }

  updateDisplay();
});

window.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/^\d$/.test(key)) {
    inputDigit(key);
    flashKey(`[data-number="${key}"]`);
  } else if (["+", "-", "*", "/"].includes(key)) {
    handleOperator(key);
    flashKey(`[data-operator="${key}"]`);
  } else if (key === "." || key === ",") {
    inputDecimal();
    flashKey('[data-action="decimal"]');
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    performEquals();
    flashKey('[data-action="equals"]');
  } else if (key === "Backspace") {
    deleteDigit();
    flashKey('[data-action="delete"]');
  } else if (key === "Escape") {
    clearCalculator();
    flashKey('[data-action="clear"]');
  } else if (key === "%") {
    applyPercent();
    flashKey('[data-action="percent"]');
  } else {
    return;
  }

  updateDisplay();
});

updateDisplay();
