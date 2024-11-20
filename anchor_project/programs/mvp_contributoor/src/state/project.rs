use anchor_lang::prelude::*;

#[account]
pub struct Project {
    pub owner: Pubkey,
    pub name: String,
    pub description: String,
    pub task_ids: Vec<Pubkey>,
    pub task_counter: u64
} 