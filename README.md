# Absence Management System - IT Department

## 📖 About the Project

This application was developed to manage student absences for the IT department of **Marie & Louis Pasteur University**. 

Built by a team of 3 students, this project started with an inherited legacy codebase. However, due to its poor code quality, we made the strategic decision to **rewrite the entire application from scratch** (both client and server architectures). 

The project was delivered on time and is fully operational. It was developed over a 4-month period, representing approximately 3 weeks of full-time work for the team, with the remaining effort completed alongside coursework. This experience allowed us to learn and master **React**, while actively implementing security measures to protect the application against common web vulnerabilities.

## ✨ Key Features

### 🎓 For Students
* **Dashboard:** View personal absence history.
* **Justifications:** Submit absence justifications directly through the app.

### 👨‍🏫 For Professors
* **Attendance Tracking:** easily take roll call directly from a smartphone or computer during class.

### ⚙️ For the Administration (Secretariat)
* **Absence Management:** Validate or reject student justifications.
* **System Configuration:** Manage user accounts, create subjects, configure special student accommodations (regimes), and adjust global app settings.
* **Impersonation System:** Ability to act on behalf of a professor to input paper-based attendance, or act on behalf of a student to upload a justification received via email.
* **Data Security:** Built-in tools to create database backups and restore previous versions directly from the interface.

### 📱 Technical Highlights
* **Responsive Design:** Optimized for both desktop and mobile screens.
* **PWA (Progressive Web App):** Users can install the application directly onto their smartphones or computers for a native-like experience.

## 📄 Documentation & Report
For more details, screenshots of the UI, and in-depth explanations of our technical choices and how we achieved this result, please check our complete project report located at: **[`report/report.pdf`](./report/report.pdf)**.

---

## 🛠 1. Prerequisites and Recommended Versions

To ensure the project functions properly, it is recommended to use the following versions. These correspond to our initial development environment:

* **Node.js**: v23.11.0
* **npm**: v10.9.2
* **React**: v19.2.1

## 🚀 2. Launch Commands (Scripts)

At the root of the project, several commands are configured in the `package.json` to launch the application according to your needs:

### Development Mode
* **`npm run dev`**: Simultaneously launches the server (with automatic reload via `nodemon`) and the client (in development mode). This is the main command to use during development. The server logs will be displayed in yellow and the client logs in blue.

> 💡 **Note for development:** Once launched via `dev`, the application is accessible by default on port `5173` (**http://localhost:5173**).

### Production Mode
* **`npm run quick-prod`**: Builds the React client application, then launches the Node.js server. Useful in development if your dependencies are already installed and you want to test the final output quickly (with optimizations).
* **`npm run prod`**: The complete command for a clean deployment. It handles the installation of all dependencies (at the root, in the client, and in the server), building the client, and then launching the server in production.

> 💡 **Note for production:** Once launched via `quick-prod` or `prod`, the application is accessible by default on port `3000` (**http://localhost:3000**).

## ⚙️ 3. Preparing the Project for Production

### Step 1: Environment Configuration
Create a `/server/.env` file identical to the `/server/.env.example` template.

1.  Replace `JWT_SECRET` with a random 128-character string. You can generate one using this command:
    ```bash
    node -e "console.log(require('crypto').randomBytes(128).toString('hex'))"
    ```
2.  Set `CORS_ORIGIN` with your allowed URL (e.g., `https://my-site.com`). If you have multiple domains, separate them with a comma (e.g., `https://my-site.com,https://api.my-site.com`).

> ⚠️ **For local development only:** You can add `ENABLE_DEV_AUTH=true` to use the test accounts (student, prof, admin) without the LDAP connection. **Never enable this in production.**

### Step 2: Database Initialization
Create the database `/server/database/appAbsences.db` by executing the following command at the root of the project:

```bash
sqlite3 server/database/appAbsences.db < server/database/schema.sql
```

### Step 3: Launching the Project
Launch the project using the following command at the root:

```bash
npm run prod
```

### Step 4: Continuous Integration (CI)
In a CI environment, simply run `npm run prod` for everything to be updated automatically (dependency installation, client build, server launch).