use anchor_lang::prelude::*;

#[account]
pub struct Contributor {
    pub name: String,
    pub tasks_process: u64,
    pub tasks_completed: u64,
    pub tasks_failed: u64
} 