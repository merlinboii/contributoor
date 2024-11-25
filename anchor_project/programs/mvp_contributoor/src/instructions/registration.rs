use anchor_lang::prelude::*;
use crate::state::*;

pub fn register_contributor(ctx: Context<CreateContributor>, contributor_name: String) -> Result<()> {
    // Access and modify the contributor account.
    let contributor_info = &mut ctx.accounts.contributor;
    let name_registry = &mut ctx.accounts.name_registry;

    contributor_info.tasks_completed = 0; // Set initial tasks_completed to 0.
    contributor_info.tasks_failed = 0; // Set initial tasks_completed to 0.
    contributor_info.name = contributor_name; // Store the name in the user_stats account.

    // Mark the name as taken in the registry
    name_registry.taken = true;
    Ok(())
}

pub fn register_project(ctx: Context<CreateProject>, name: String, description: String) -> Result<()> {
    // Access and modify the project.
    let project = &mut ctx.accounts.project;
    let user = &ctx.accounts.user;

    project.owner = user.key();
    project.name = name; // Store the name in the project account.
    project.description = description; // Store the description in the project account.
    project.task_counter = 0;
    Ok(())
} 

// Accounts context structure for creating user statistics.
#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateContributor<'info> {
    #[account(mut)]
    pub user: Signer<'info>, // Signer who pays for the contributor account creation and processing.
    // Initializes a contributor account with predefined space allocation.
    #[account(
        init,
        payer = user,
        space = 8 + 2 + 4 + 200 + 1, // Account size calculation includes all fields.
        seeds = [b"contributor-info", user.key().as_ref()], // Seeds for deterministic address.
        bump
    )]
    pub contributor: Account<'info, Contributor>, // The contributor account to be created.

    #[account(
        init,
        payer = user,
        space = 8 + 1,
        seeds = [b"contributor-name", name.as_bytes()], // Changed: using raw name instead of hash
        bump
    )]
    pub name_registry: Account<'info, NameRegistry>,
    pub system_program: Program<'info, System>, // System program to handle account creation.

}

// Accounts context structure for creating the project owner account.
#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateProject<'info> {
    #[account(mut)]
    pub user: Signer<'info>, // Signer who pays for the project owner account creation and processing.
    // Initializes a project owner account with predefined space allocation.
    #[account(
        init,
        payer = user,
        space = 8 + 2 + 4 + 200 + 1, // Account size calculation includes all fields.
        seeds = [b"project-info", user.key().as_ref()], // Seeds for deterministic address.
        bump
    )]
    pub project: Account<'info, Project>, // The project_owner account to be created.

    #[account(
        init,
        payer = user,
        space = 8 + 1,
        seeds = [b"contributor-name", name.as_bytes()], // Changed: using raw name instead of hash
        bump
    )]
    pub name_registry: Account<'info, NameRegistry>,
    pub system_program: Program<'info, System>, // System program to handle account creation.

}