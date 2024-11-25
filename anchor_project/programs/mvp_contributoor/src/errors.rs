use anchor_lang::prelude::*;

#[error_code]
pub enum CreateAccountError {
    #[msg("Name already taken")]
    NameTaken,
    #[msg("Contributor already exists")]
    ContributorExists,
}

#[error_code]
pub enum CreateTaskError {
    #[msg("You do not have sufficient privileges to create the task")]
    WrongPrivileges,
}

#[error_code]
pub enum TaskError {
    #[msg("Task is not open or being claimed")]
    TaskNotOpenOrBeingClaimed,
    #[msg("Task is not claimed")]
    TaskNotClaimed,
    #[msg("Task is not ended")]
    TaskNotEnded,
    #[msg("Task is not submitted")]
    TaskNotSubmitted,
}

#[error_code]
pub enum TaskUnauthorizedError {
    #[msg("You do not have sufficient privileges to create or update the task")]
    UnauthorizedAccess,
    #[msg("Cannot claim your own task")]
    CannotClaimOwnTask,
    #[msg("Only the assignee can complete the task")]
    NotTaskAssignee,
} 