use anchor_lang::prelude::*;
use crate::errors::*;

#[account]
pub struct Task {
    pub uuid: u64,
    pub name: String,
    pub description: String,
    pub status: TaskStatus,
    pub project: Pubkey,
    pub creator: Pubkey,
    pub duration: u32,
    pub assignee: Option<Pubkey>,
    pub bump: u8,
}

impl Task {
    pub fn create(
        &mut self,
        uuid: u64,
        name: String,
        description: String,
        project: Pubkey,
        creator: Pubkey,
        duration: u32
    ) {
        self.uuid = uuid;
        self.name = name;
        self.description = description;
        self.status = TaskStatus::Open;
        self.project = project;
        self.creator = creator;
        self.duration = duration;
        self.assignee = None;
    }

    pub fn update(
        &mut self,
        name: Option<String>,
        description: Option<String>,
        duration: Option<u32>
    ) {
        if let Some(name) = name {
            self.name = name;
        }
        if let Some(description) = description {
            self.description = description;
        }
        if let Some(duration) = duration {
            self.duration = duration;
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum TaskStatus {
    Open,
    Claimed,
    Submitted,
    Completed
} 