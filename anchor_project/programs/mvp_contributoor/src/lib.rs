use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;
use crate::state::TaskStatus;


declare_id!("Au7tS1bnJSi4ieFJrrSkdukxnUS2fwVcczrj1vtbCuWy");

#[program]
pub mod mvp_contributoor {
    use super::*;
    
    pub fn register_contributor(ctx: Context<CreateContributor>, contributor_name: String) -> Result<()> {
        instructions::registration::register_contributor(ctx, contributor_name)
    }

    pub fn register_project(ctx: Context<CreateProject>, name: String, description: String) -> Result<()> {
        instructions::registration::register_project(ctx, name, description)
    }

    pub fn create_task(ctx: Context<CreateTask>, task_name: String, task_description: String, duration: u32) -> Result<()> {
        instructions::tasks::create_task(ctx, task_name, task_description, duration)
    }

    pub fn update_task(ctx: Context<UpdateTask>, task_id: u64, task_name: Option<String>, task_description: Option<String>, status: Option<TaskStatus>, duration: Option<u32>) -> Result<()> {
        instructions::tasks::update_task(ctx, task_id, task_name, task_description, status, duration)
    }
}