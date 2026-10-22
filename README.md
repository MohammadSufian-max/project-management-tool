# ProjectFlow - Project Management Tool

A responsive frontend project management application built with React, TypeScript, and Vite. ProjectFlow helps manage employees, projects, teams, tasks, and project progress through a role-based interface.

## Features

### Authentication
- Demo login with predefined credentials.
- Form validation using React Hook Form and Zod.
- Persistent client-side session using Zustand.
- Protected routes and role-based navigation.
- Logout functionality.

### Employee Management
- Create, view, edit, and deactivate employee records.
- Search employees.
- Validate required fields, email format, unique email addresses, and phone numbers.
- Assign employee roles, departments, and joining dates.

### Project Management
- Create and edit projects.
- Assign a Project Manager and active team members.
- Validate project details and date ranges.
- View project details, team members, tasks, and calculated progress.
- Archive projects.

### Task Management
- Create, edit, and delete tasks according to application permissions.
- Assign tasks to eligible team members of the selected project.
- Manage task priority, status, start date, and due date.
- Validate task assignments and project date constraints.
- Display task information and deadlines.

### Dashboard and Profile
- Dashboard statistics and project progress calculated from mock data.
- Task status, overdue tasks, and project summaries.
- Profile editing for permitted personal details.
- Responsive layouts for mobile, tablet, and desktop.
- Loading, empty, error, and success feedback where implemented.

## Technology Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- Zustand
- Lucide React
- React Hook Form
- Zod
- TanStack Query
- Browser localStorage for demo persistence

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository or download the project source, then open a terminal in the project directory.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

### Production Build

Run the TypeScript checks and generate the production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Demo Credentials

### Super Admin

- Email: `admin@demo.com`
- Password: `Admin@123`

### Employee

- Email: `employee@demo.com`
- Password: `Employee@123`

Use these predefined credentials to explore the application's demo authentication and role-based interface.

## Project Structure

```text
src/
├── assets/          # Static assets
├── components/      # Shared components and navigation
│   ├── common/      # Protected route components
│   └── ui/          # UI components
├── data/            # Mock employees, projects, tasks, and users
├── lib/             # Shared utilities
├── pages/           # Login, Dashboard, Employees, Projects,
│                    # Project Details, Tasks, and Profile
├── schemas/         # Form validation schemas
├── services/        # Mock authentication, data, and storage services
├── store/           # Zustand session state
├── types/           # TypeScript interfaces and types
├── App.tsx          # Application routes
├── index.css        # Global styles
└── main.tsx         # Application entry point
```

## Architecture Notes

- **Pages and components:** React components provide the application interface and reusable UI elements.
- **Routing:** React Router manages navigation, protected pages, and project detail routes.
- **Forms and validation:** React Hook Form manages form state, while Zod validates user input.
- **Server-state patterns:** TanStack Query manages asynchronous mock data operations, loading and error states, mutations, and cache invalidation.
- **Session state:** Zustand manages the demo authentication session.
- **Data persistence:** Mock services use browser localStorage to retain supported changes across refreshes.

## Important Notes

- This is a frontend demonstration project. It does not include a production backend, database, or server-side authentication.
- Demo credentials are predefined for demonstration purposes and must not be used as real account credentials.
- Application data is stored locally in the browser where persistence is implemented.
- Clearing browser storage may reset the locally persisted demo data.

## Future Improvements

- Integrate a backend API and database.
- Implement secure server-side authentication and authorization.
- Add automated tests.
- Add production deployment and continuous integration.

## License

Add an appropriate license before distributing this project publicly.
