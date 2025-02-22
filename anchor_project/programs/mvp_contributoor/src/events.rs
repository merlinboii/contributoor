use anchor_lang::prelude::*;
use crate::state::task::TaskStatus;

#[event]
pub struct TaskEvent {
    pub uuid: u64,
    pub name: String,
    pub status: TaskStatus,
    pub project: Pubkey,
    pub creator: Pubkey,
    pub duration: u32,
}