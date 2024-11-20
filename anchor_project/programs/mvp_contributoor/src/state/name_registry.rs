use anchor_lang::prelude::*;

#[account]
pub struct NameRegistry {
    pub taken: bool,
} 