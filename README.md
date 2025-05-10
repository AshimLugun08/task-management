This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




Overview
This is a Task Management Web Application built with Next.js, Tailwind CSS, and MongoDB, deployed on Vercel. It helps teams manage tasks across different project stages with an intuitive drag-and-drop board interface and a searchable task list.
Users can log in using Google Authentication via NextAuth, and will be redirected to a comprehensive dashboard upon successful login.
________________________________________
Features
✅ User Authentication
•	Google login using NextAuth
•	Secure session management
•	Redirects to the /dashboard upon login
•	Logout functionality that redirects back to /
🧭 App Routes
/dashboard
•	Default landing page after login
•	Shows key task management interface
/board
•	Displays all tasks across four stages:
o	To Do
o	In Progress
o	Testing
o	Done
•	Allows task creation, editing, and assignment to employees
•	View task statuses in a Kanban-style layout
/project
•	Lists all tasks in a searchable table format
•	Allows:
o	Searching tasks by name
o	Selecting and deleting tasks
/create
•	Form-based interface to create a new task
•	Assign task to an employee
•	Set task status and other details
________________________________________
Task Workflow
1.	Login with Google to access the app.
2.	Navigate to /board to manage tasks visually.
3.	Drag-and-drop or edit tasks to change status or assignee.
4.	Use the /project route to search or delete tasks.
5.	Create new tasks via the /create route.
6.	Logout to securely end your session.
________________________________________
Tech Stack
Technology	Description
Next.js	React framework for frontend/backend
Tailwind CSS	Utility-first CSS styling
MongoDB	NoSQL database for task storage
Vercel	Hosting and deployment
NextAuth	Authentication using Google OAuth

