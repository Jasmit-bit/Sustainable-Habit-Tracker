# Sustainable Habit Tracker

### The app is hosted via vercel on https://habittracker-gamma-five.vercel.app/ but the backend is running on Supabase free trial so the backend may not be active contact me and I will activate the backend if you want to actually use the webapp.


## Tech Stack

* **Frontend:** React, React Router, Vite, Recharts
* **Backend & Database:** JavaScript and Supabase (PostgreSQL, Auth)
* **Testing:** Vitest
* **Styling:** CSS

---

## How to Install and Run the App Locally

Follow these steps to get the web app running on your machine.

### Prerequisites
Before you begin, make sure you have [Node.js](https://nodejs.org/) installed on your computer. This includes `npm` (Node Package Manager), which is needed to install the project dependencies.

### Installation & Setup

**1. Download the Project** Download or clone the entire project folder to your local machine from GitLab.

**2. Navigate to the Project Directory** Open your terminal or command prompt and navigate into the project folder:
```bash
cd "Sustainable Habit Tracker"
```

**3. Install Dependencies** If this is your first time running the project, you need to install all the required packages. Run the following command in your terminal:
```bash
npm install
```
**4. Start the Development Server** Once the install is complete, start the local server by running:
```bash
npm run dev
```

**5. Open in Your Browser** After running the start command, your terminal will give you a local link (usually `http://localhost:5173` or `http://localhost:3000`). `Ctrl + Click` (or `Cmd + Click` on Mac) the link in the terminal to open the app in your browser and then use the web app.

**6. Running The Tests** To verify the application logic and UI integration tests, run the following command in your terminal:
```bash
npx vitest
```
**Note** : Some tests will fail but thats explained in the testing doc
