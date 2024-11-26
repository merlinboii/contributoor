use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;
use crate::state::TaskStatus;


declare_id!("4RZQo3d4HTy971QBHYorECL62y11jzJxsg5ppvCvrSbz");

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

    pub fn update_task_info(ctx: Context<UpdateTask>, task_id: u64, task_name: Option<String>, task_description: Option<String>) -> Result<()> {
        instructions::tasks::update_task_info(ctx, task_id, task_name, task_description)
    }

    pub fn update_task_duration(ctx: Context<UpdateTask>, task_id: u64, duration: Option<u32>) -> Result<()> {
        instructions::tasks::update_task_duration(ctx, task_id, duration)
    }

    pub fn claim_task(ctx: Context<ClaimTask>, task_id: u64) -> Result<()> {
        instructions::tasks::claim_task(ctx, task_id)
    }

    pub fn submit_task(ctx: Context<SubmitTask>, task_id: u64) -> Result<()> {
        instructions::tasks::submit_task(ctx, task_id)
    }   

    pub fn approve_task(ctx: Context<ApproveTask>, task_id: u64) -> Result<()> {
        instructions::tasks::approve_task(ctx, task_id)
    }

    pub fn reject_task(ctx: Context<RejectTask>, task_id: u64) -> Result<()> {
        instructions::tasks::reject_task(ctx, task_id)
    }

}
