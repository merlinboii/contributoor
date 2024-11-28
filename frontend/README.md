
![Home](./assets/pages/cover.png)
# Contributoor Solana dApp
This is a simple dApp that allows a project to create tasks and a contributor to complete them.

The project is built with React, Typescript, Anchor, and Solana.

## Installation

```bash
npm install
# or
yarn install
```

## Build and Run

Next, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Endpoints

### Public endpoints
* **Home**: [http://localhost:3000/](http://localhost:3000/)

### Restricted endpoints

#### No account
* **Project Register**: [http://localhost:3000/project-register](http://localhost:3000/project-register)
* **Contributor Register**: [http://localhost:3000/contributor-register](http://localhost:3000/contributor-register)

#### Project account
* **Create Task**: [http://localhost:3000/create-task](http://localhost:3000/create-task)
* **Project Dashboard**: [http://localhost:3000/project-dashboard](http://localhost:3000/project-dashboard)


#### Contributor account
* **Tasks Dashboard**: [http://localhost:3000/tasks-dashboard](http://localhost:3000/tasks-dashboard)

## UI: Main Pages
This section provides an overview of the main pages within the dApp.

### Home page
![Home](./assets/pages/home.png)

### Wallet Integration
![Wallet Integration](./assets/pages/wallet-integration.png)

### Project Register page
![Project Register](./assets/pages/project-register.png)

### Contributor Register page
![Contributor Register](./assets/pages/contributor-register.png)

### Project Dashboard
![Project Dashboard](./assets/pages/project-dashboard.png)

### Tasks Dashboard
![Tasks Dashboard](./assets/pages/task-dashboard.png)

### Tasks Dashboard for Contributor
![Tasks Dashboard](./assets/pages/user-dashboard.png)

### Task Create
![Task Create](./assets/pages/task-creation.png)

### Task Update
![Task Update](./assets/pages/task-update.png)

## UI: Task Status Experience
This section provides an overview of the task status experience within the dApp as a project owner and a contributor.

#### Project Account
* Task Open 
    - Project dashboard
<br/>![Task Open](./assets/task-status/project-own-dashbaord-open.png)
    - Tasks dashboard
        - Other tasks
        <br/>![Other Tasks](./assets/task-status/contributor-open.png)
        - Own tasks: hover on the task card to see disable actions to claim their tasks
        <br/>![Task Open](./assets/task-status/project-task-dashboard-open.png)

* Task Claimed
<br/>![Task Claimed](./assets/task-status/project-be-claimed.png)

* Task Submitted
<br/>![Task Submitted](./assets/task-status/project-be-submitted.png)

* Task Completed: When the task is approved by the owner, for rejected tasks, the task will automatically be re-opened.
<br/>![Task Completed](./assets/task-status/project-complete.png)

* Task Overdue
<br/>![Task Overdue](./assets/task-status/project-overdue.png)

#### Contributor Account
* Task Open
<br/>![Task Open](./assets/task-status/contributor-open.png)
* Task Claimed
<br/>![Task Claimed](./assets/task-status/contributor-claim.png)
* Task Submitted
<br/>![Task Submitted](./assets/task-status/contributor-submit.png)
* Task Overdue (waiting for owner to reject)
<br/>![Task Overdue](./assets/task-status/contributor-overdue.png)
* Task Progress Count
<br/>![Task Progress Count](./assets/task-status/contributor-progress-count.png)
