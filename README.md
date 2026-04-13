# 🚀 Pushdown Automaton (PDA) Simulator

An interactive web-based simulator for designing, visualizing, and testing **Pushdown Automata (PDA)** used in Theory of Computation.

This project allows users to define states, transitions, and stack operations, and then simulate how a PDA processes an input string step-by-step.

---

## 📌 Features

* 🎯 Design custom PDA (states, transitions, stack symbols)
* 🔁 Step-by-step simulation
* ▶️ Auto-play execution
* 📊 Real-time visualization of:

  * Current state
  * Input tape
  * Stack operations
* ⚡ Support for **ε (epsilon) transitions**
* ✅ Acceptance by:

  1. Final state
  2. Empty stack
* 🧠 Preloaded example: **L = 0ⁿ1ⁿ**

---

## 🛠️ Tech Stack

* HTML5
* CSS3
* JavaScript (Vanilla JS)

---

## 📂 Project Structure

```
├── index.html     # Main UI structure
├── style.css      # Styling and layout
├── app.js         # PDA logic and simulation engine
```

---

## ⚙️ How It Works

The simulator mimics a Pushdown Automaton using:

* State tracking
* Stack operations (push/pop)
* Input pointer movement

Transitions are defined as:

```
δ(state, input, stackTop) → (nextState, push)
```

The system dynamically:

* Finds valid transitions
* Updates stack
* Moves input pointer
* Changes state

---

## ▶️ How to Run

1. Download or clone the repository
2. Open `index.html` in any browser
3. Define your PDA or load example
4. Enter input string
5. Click:

   * **Load Input**
   * **Step Forward / Auto Play**

---

## 📸 Example

Language:

```
L = 0ⁿ1ⁿ
```

Input:

```
0011
```

---

## 🎓 Learning Outcomes

* Understanding of Pushdown Automata
* Stack-based computation
* Context-Free Languages (CFL)
* Automata simulation logic

---

## 📌 Key Implementation Details

* Event-driven UI handling and simulation logic 
* Dynamic DOM updates for visualization 
* CSS-based animations for stack operations 

---

## 🚧 Future Improvements

* Graph visualization of PDA
* Support for NPDA (Non-deterministic PDA)
* Save/load configurations
* Mobile responsiveness

---

## 👨‍💻 Author

**Daksh Jain**

---

## ⭐ If you like this project

Give it a star ⭐ on GitHub!
