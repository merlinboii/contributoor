use anchor_lang::prelude::*;

#[account]
pub struct TaskAssignment {
    pub task_id: u64,
    pub assignee: Option<Pubkey>,
    pub start_time: Option<i64>, // Use Unix timestamp for time
    pub end_time: Option<i64>,
}

impl TaskAssignment {
    pub fn assign(
        &mut self,
        task_id: u64,
        assignee: Pubkey,
        start_time: i64,
        end_time: i64,
    ) {
        self.task_id = task_id;
        self.assignee = Some(assignee);
        self.start_time = Some(start_time);
        self.end_time = Some(end_time);
    }

    pub fn reset(&mut self) {
        self.task_id = 0;
        self.assignee = None;
        self.start_time = None;
        self.end_time = None;
    }
} 