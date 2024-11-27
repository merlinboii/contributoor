
# MVP Contributoor
MVP Contributoor is a Solana program designed to manage contributors and projects, allowing users to register as contributors, create projects, and manage tasks within those projects. This program is built using the Anchor framework, which simplifies Solana smart contract development.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview
The MVP Contributoor program allows users to:
- Register as contributor or project owner.
- Create and manage projects.
- Create, update, claim, submit, approve, and reject tasks within projects.


## Installation
To set up the project locally, follow these steps:
1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/mvp_contributoor.git
   cd mvp_contributoor
   ```


2. **Install dependencies:**
- [Rust installed](https://www.rust-lang.org/tools/install)
    - Make sure to use stable version:
    ```bash
    rustup default stable
    ```
- [Solana installed](https://docs.solana.com/cli/install-solana-cli-tools)
    - Use v1.18.18
    - After you have Solana-CLI installed, you can switch between versions using:
    ```bash
    solana-install init 1.18.18
    ```

- [Anchor installed](https://www.anchor-lang.com/docs/installation)
    - Use v0.30.1
    - After you have Anchor installed, you can switch between versions using:
    ```bash
    avm use 0.30.1
    ```

3. **Build the program:**

   ```bash
   anchor build
   ```

## Program Structure
The program is organized into several modules:

- **`events`**: Defines events emitted by the program.
- **`instructions`**: Defines the instructions that can be called by the program.
- **`state`**: Defines the state of the program.
- **`error`**: Defines the errors that can be returned by the program.

## Usage
### Registering a Contributor
To register a contributor, use the `register_contributor` function:
```rust
pub fn register_contributor(ctx: Context<CreateContributor>, contributor_name: String) -> Result<()>
```

### Creating a Project
To create a project, use the `register_project` function:
```rust
pub fn register_project(ctx: Context<CreateProject>, name: String, description: String) -> Result<()>
```

### Managing Tasks

Tasks can be created, updated, claimed, submitted, approved, and rejected using the respective functions:

- `create_task`
- `update_task`
- `claim_task`
- `submit_task`
- `approve_task`
- `reject_task`


## Testing
The project includes a suite of tests written in TypeScript using the Anchor testing framework. To run the tests, execute:
```bash
anchor test
```
The tests cover various scenarios, including contributor registration, project creation, and task management.

* [Registration Tests](./tests/register.test.ts)
* [Task Management Tests](./tests/task.test.ts)

### Test Tasks
| Topic                      | Test Cases                                              | Description                                                                                   |
|----------------------------|--------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| **Contributor Registration** | Registers a contributor successfully                 | Tests the successful registration of a new contributor.                                       |
|                            | Cannot register the same contributor twice            | Ensures that a user cannot register the same contributor name twice.                         |
|                            | Cannot register the same contributor name twice       | Verifies that two different users cannot register with the same contributor name.            |
| **Project Registration**    | Registers a project successfully                     | Tests the successful registration of a new project.                                          |
|                            | Cannot register the same project name twice          | Ensures that two different users cannot register projects with the same name.                |
| **Task Creation**           | Creates a task successfully                          | Tests the successful creation of a task by the project owner.                                |
|                            | Prevents non-owner from creating tasks               | Ensures that only the project owner can create tasks.                                        |
| **Task Update**             | Allows owner to update task info successfully        | Tests that the project owner can update task information.                                    |
|                            | Allows owner to update task duration successfully    | Tests that the project owner can update the task duration.                                   |
| **Task Assignment**         | Allows assignee to claim task successfully           | Tests that a contributor can claim a task.                                                  |
|                            | Prevents non-assignee from claiming task             | Ensures that only the intended assignee can claim a task.                                    |
| **Task Submission**         | Allows assignee to submit task successfully          | Tests that the assignee can submit a task.                                                  |
|                            | Prevents non-assignee from submitting task           | Ensures that only the assignee can submit a task.                                            |
| **Task Approval and Rejection** | Allows owner to approve task successfully      | Tests that the project owner can approve a submitted task.                                   |
|                            | Prevents non-owner from approving task               | Ensures that only the project owner can approve a task.                                      |
|                            | Allows owner to reject task successfully             | Tests that the project owner can reject a submitted task.                                    |
|                            | Prevents non-owner from rejecting task               | Ensures that only the project owner can reject a task.                                       |


## Security
The program is currently in its **prototyping phase**, with a focus on developing core functionality. As such, **comprehensive security measures** have not yet been implemented. This approach prioritizes rapid iteration and feature development, acknowledging that robust security practices will be integrated in later stages when the system transitions towards production readiness.
