use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::events::*;

pub fn create_task(
    ctx: Context<CreateTask>,
    name: String,
    description: String,
    duration: u32,
) -> Result<()> {
    let project = &mut ctx.accounts.project;
    let task = &mut ctx.accounts.task;

    // Initialize the task
    task.create(
        project.task_counter,
        name,
        description,
        project.key(),
        ctx.accounts.user.key(),
        duration,
    );

    // Add the task to the project's task list
    project.task_counter += 1;
    
    emit!(TaskEvent {
        uuid: task.uuid.clone(),
        name: task.name.clone(),
        status: task.status.clone(),
        project: task.project,
        creator: task.creator,
        duration: task.duration,
    });
    Ok(())
}

pub fn update_task_info(
    ctx: Context<UpdateTask>,
    task_id: u64,
    name: Option<String>,
    description: Option<String>
) -> Result<()> {
    let task = &mut ctx.accounts.task;
    
    require!(task.creator == ctx.accounts.user.key(), TaskUnauthorizedError::UnauthorizedAccess);
    require!(task.status == TaskStatus::Open, TaskError::TaskNotOpenOrBeingClaimed);

    let task_duration = task.duration;

    // Update task fields
    task.update(name, description, Some(task_duration));

    emit!(TaskEvent {
        uuid: task.uuid,
        name: task.name.clone(),
        status: task.status.clone(),
        project: task.project,
        creator: task.creator,
        duration: task.duration,
    });
    Ok(())
}

pub fn update_task_duration(
    ctx: Context<UpdateTask>,
    task_id: u64,
    duration: Option<u32>
) -> Result<()> {
    let task = &mut ctx.accounts.task;
    
    require!(task.creator == ctx.accounts.user.key(), TaskUnauthorizedError::UnauthorizedAccess);
    require!(task.status == TaskStatus::Open, TaskError::TaskNotOpenOrBeingClaimed);

    // Clone necessary fields before mutable borrow
    let task_name = task.name.clone();
    let task_description = task.description.clone();

    // Update task fields
    task.update(Some(task_name), Some(task_description), duration);

    emit!(TaskEvent {
        uuid: task.uuid,
        name: task.name.clone(),
        status: task.status.clone(),
        project: task.project,
        creator: task.creator,
        duration: task.duration,
    });
    Ok(())
}

pub fn claim_task(ctx: Context<ClaimTask>, task_id: u64) -> Result<()> {
    let task = &mut ctx.accounts.task;
    let task_assignment = &mut ctx.accounts.task_assignment;
    let user = &ctx.accounts.user;
    let contributor = &mut ctx.accounts.contributor;
    let clock = Clock::get().unwrap();

    // Ensure the task is open before claiming
    require!(task.status == TaskStatus::Open, TaskError::TaskNotOpenOrBeingClaimed);

    // Ensure the user is not the project owner
    require!(user.key() != task.creator, TaskUnauthorizedError::CannotClaimOwnTask);

    // Create a new task assignment
    task_assignment.assign(task_id, user.key(), clock.unix_timestamp, clock.unix_timestamp + task.duration as i64);

    // Update the task status to claimed
    task.status = TaskStatus::Claimed;
    task.assignee = Some(user.key());

    contributor.tasks_process += 1;

    Ok(())
}

pub fn submit_task(ctx: Context<SubmitTask>, task_id: u64) -> Result<()> {
    let task_assignment = &ctx.accounts.task_assignment;
    let task = &mut ctx.accounts.task;
    let user = &ctx.accounts.user;
    let clock = Clock::get().unwrap();
    // Ensure the user is the assignee of the task
    require!(task_assignment.assignee == Some(user.key()), TaskUnauthorizedError::NotTaskAssignee);

    // Ensure the task is in a claimed state
    require!(task.status == TaskStatus::Claimed, TaskError::TaskNotClaimed);

    // Ensure the task is not ended duration
    require!(
        task_assignment.end_time.unwrap_or(0) > clock.unix_timestamp as i64,
        TaskError::TaskNotEnded
    );
    // Update the task status to submitted
    task.status = TaskStatus::Submitted;

    Ok(())
}

pub fn approve_task(ctx: Context<ApproveTask>, task_id: u64) -> Result<()> {
    let task = &mut ctx.accounts.task;
    let task_assignment = &mut ctx.accounts.task_assignment;
    let user = &ctx.accounts.user;
    let contributor: &mut Account<'_, Contributor> = &mut ctx.accounts.contributor;
    // Ensure the user is the creator of the task
    require!(task.creator == user.key(), TaskUnauthorizedError::UnauthorizedAccess);

    // Ensure the task is in a submitted state
    require!(task.status == TaskStatus::Submitted, TaskError::TaskNotSubmitted);

    // Update the task status to approved
    task.status = TaskStatus::Completed;
    task.assignee = None;

    // Reset the task assignment
    task_assignment.reset();

    contributor.tasks_completed += 1;
    contributor.tasks_process -= 1;

    Ok(())
}

pub fn reject_task(ctx: Context<RejectTask>, task_id: u64) -> Result<()> {
    let task = &mut ctx.accounts.task;
    let task_assignment = &mut ctx.accounts.task_assignment;
    let user = &ctx.accounts.user;
    let contributor = &mut ctx.accounts.contributor;

    // Ensure the user is the creator of the task
    require!(task.creator == user.key(), TaskUnauthorizedError::UnauthorizedAccess);

    // Ensure the task is in a submitted state
    require!(task.status == TaskStatus::Submitted, TaskError::TaskNotSubmitted);

    // Update the task status to rejected
    task.status = TaskStatus::Open;
    task.assignee = None;

    // Reset the task assignment
    task_assignment.reset();

    contributor.tasks_failed += 1;
    contributor.tasks_process -= 1;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateTask<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub project: Account<'info, Project>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 +  // discriminator
                32 + // owner
                (4 + 50) + // name (4 for string length + max 50 chars)
                (4 + 200) + // description (4 for string length + max 200 chars)
                50 + // task_counter
                1, // bump        
        seeds = [
            b"task-info",
            project.key().as_ref(),
            &project.task_counter.to_le_bytes()
        ],
        bump,
        constraint = project.owner == user.key() @ CreateTaskError::WrongPrivileges,
    )]
    pub task: Account<'info, Task>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(task_id: u64)]
pub struct UpdateTask<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [
            b"task-info",
            project.key().as_ref(), // Use the project key as a seed
            &task_id.to_le_bytes() // Use the task counter as a seed
        ],
        bump,
    )]
    pub task: Account<'info, Task>,
}

// Context for claiming a task
#[derive(Accounts)]
#[instruction(task_id: u64)]
pub struct ClaimTask<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [
            b"task-info",
            project.key().as_ref(), // Use the project key as a seed
            &task_id.to_le_bytes() // Use the task counter as a seed
        ],
        bump,
    )]
    pub task: Account<'info, Task>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 32 + 8 + 8,
        seeds = [
            b"task-assignment",
            task.key().as_ref(),
            user.key().as_ref()
        ],
        bump,
    )]
    pub task_assignment: Account<'info, TaskAssignment>,

    #[account(
        mut,
        seeds = [b"contributor-info", user.key().as_ref()], // Seeds for deterministic address.
        bump
    )]
    pub contributor: Account<'info, Contributor>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(task_id: u64)]
pub struct SubmitTask<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [
            b"task-info",
            project.key().as_ref(), // Use the project key as a seed
            &task_id.to_le_bytes() // Use the task counter as a seed
        ],
        bump,
    )]
    pub task: Account<'info, Task>,

    #[account(
        mut,
        seeds = [
            b"task-assignment",
            task.key().as_ref(),
            task.assignee.unwrap().as_ref()
        ],
        bump,
    )]
    pub task_assignment: Account<'info, TaskAssignment>,

    #[account(
        mut,
        seeds = [b"contributor-info", user.key().as_ref()], // Seeds for deterministic address.
        bump
    )]
    pub contributor: Account<'info, Contributor>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(task_id: u64)]
pub struct ApproveTask<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [
            b"task-info",
            project.key().as_ref(),
            &task_id.to_le_bytes()
        ],
        bump,
    )]
    pub task: Account<'info, Task>,

    #[account(
        mut,
        seeds = [
            b"task-assignment",
            task.key().as_ref(),
            task.assignee.unwrap().as_ref() 
        ],
        bump,
    )]
    pub task_assignment: Account<'info, TaskAssignment>,

    #[account(
        mut,
        seeds = [b"contributor-info", task.assignee.unwrap().as_ref()], // Seeds for deterministic address.
        bump
    )]
    pub contributor: Account<'info, Contributor>,
}

#[derive(Accounts)]
#[instruction(task_id: u64)]
pub struct RejectTask<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [
            b"task-info",
            project.key().as_ref(),
            &task_id.to_le_bytes()
        ],
        bump,
    )]
    pub task: Account<'info, Task>,

    #[account(
        mut,
        seeds = [
            b"task-assignment",
            task.key().as_ref(),
            task.assignee.unwrap().as_ref()
        ],
        bump,
    )]
    pub task_assignment: Account<'info, TaskAssignment>,

    #[account(
        mut,
        seeds = [b"contributor-info", task.assignee.unwrap().as_ref()], // Seeds for deterministic address.
        bump
    )]
    pub contributor: Account<'info, Contributor>,
}