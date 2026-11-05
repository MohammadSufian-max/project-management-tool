# 🚀 ProjectFlow – Project Management Tool

A full-stack **Project Management Tool** designed to help organizations manage employees, projects, teams, and tasks efficiently through a centralized platform.

ProjectFlow provides role-based access, employee onboarding, project management, task assignment, progress tracking, and a real-time dashboard.

🔗 **Live Demo:** [ProjectFlow](https://project-management-tool-flax-six.vercel.app/)

💻 **GitHub Repository:** [Project Management Tool](https://github.com/MohammadSufian-max/project-management-tool)

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure login using JWT authentication.
- Role-based access control.
- Separate access for Super Admin and Employees.
- Protected routes and authenticated API requests.

### 👥 Employee Management
- Add and onboard new employees.
- View employee details.
- Edit employee information.
- Activate and deactivate employee accounts.
- Manage employee roles and departments.

### 📁 Project Management
- Create and manage projects.
- Assign Project Managers.
- Add team members to projects.
- Update project details and status.
- Archive projects.
- Track project progress.

### ✅ Task Management
- Create, update, and delete tasks.
- Assign tasks to eligible project team members.
- Set task priority: Low, Medium, High.
- Manage task status: To Do, In Progress, Done.
- Validate task dates against project timelines.
- Employees can update the status of their assigned tasks.

### 📊 Dashboard
- View project and task statistics.
- Track completed and pending tasks.
- Monitor overdue tasks.
- Calculate project progress automatically.
- Role-based dashboard information.

### 👤 Profile Management
- View personal profile information.
- Update name and phone number.
- Securely retrieve profile details from the backend.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Lucide React
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- TypeORM
- JWT Authentication
- Bcrypt

### Database
- MySQL
- Aiven Cloud MySQL

### Deployment & Tools
- Vercel – Frontend Hosting
- Render – Backend Hosting
- Git & GitHub
- Postman
- MySQL Workbench

---

## 🏗️ Application Architecture

```text
                 PROJECTFLOW
                      |
          +-----------+-----------+
          |                       |
      Frontend                 Backend
          |                       |
    React + Vite             Node.js
    TypeScript               Express.js
    Tailwind CSS             TypeScript
          |                       |
          |                  REST APIs
          |                       |
          +----------+------------+
                     |
                  MySQL
                     |
                Aiven Cloud
```

---

## 👤 User Roles

| Role | Permissions |
|---|---|
| Super Admin | Manage employees, projects, teams, and tasks |
| Employee | View assigned tasks and update their task status |

---

## 🔑 Demo Credentials

### Super Admin
```text
Email: admin@demo.com
Password: Admin@123
```

### Employee
```text
Email: employee@demo.com
Password: Employee@123
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MohammadSufian-max/project-management-tool.git
```

```bash
cd project-management-tool
```

### 2. Frontend Setup

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

### 3. Backend Setup

Open another terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_DATABASE=project_management

JWT_SECRET=your_strong_secret_key
```

Configure your MySQL database and update the environment variables accordingly.

Start the backend:

```bash
npm run dev
```

Backend will run at:

```text
http://localhost:5000
```

---

## 🌐 Deployment

ProjectFlow is deployed using the following cloud services:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Aiven MySQL |

---

## 🔒 Security

- JWT-based authentication.
- Password hashing using Bcrypt.
- Protected API endpoints.
- Role-based authorization.
- Environment variables for sensitive configuration.
- Server-side input validation.

---

## 📌 Key Highlights

- Full-stack application with React and Node.js.
- RESTful API integration.
- Relational database design using MySQL.
- Role-based authentication and authorization.
- Persistent cloud database integration.
- Responsive user interface.
- Automated project progress calculation.
- Cloud deployment using Vercel, Render, and Aiven.

---

## 👨‍💻 Author

**Mohammad Sufiyan**

B.Tech – Computer Science (AI & Data Science)

📍 Kanpur, Uttar Pradesh, India

- GitHub: [MohammadSufian-max](https://github.com/MohammadSufian-max)
- LinkedIn: [Connect with me](https://www.linkedin.com/)

---

⭐ If you find this project interesting, consider giving it a star!

**Built with ❤️ using React, Node.js, TypeScript, and MySQL.**
