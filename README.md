# Sustainable Habit Tracker

Welcome to the **Sustainable Habit Tracker**! This first Prototype web app is made to help users track their sustainable daily habits, reduce their carbon footprint, and compete with friends and family to hit monthly CO2 reduction goals.

## Web App Breakdown

* **Secure Authentication:** User signup and login powered by Supabase.
* **Family & Household Dashboard:** * Create a household or join an existing one using a Invite code.
    * Set and edit monthly household CO2 reduction goals (Only doable by an admin for now).
    * Leaderboard showing all members and their individual progress.
* **Habit Logging:** Log daily sustainable actions (like taking the bus, recycling, or eating plant-based meals) to rack up CO2 savings.
* **Adjustable Accessibility Settings:**
    * Customizable color themes (Green, Blue, Sunset, Warm Sand).
    * Adjustable text size and screen brightness.
    * Dark Mode support.

## Tech Stack

* **Frontend:** React, React Router
* **Backend & Database:** Supabase (PostgreSQL, Auth)
* **Styling:** Custom CSS 

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