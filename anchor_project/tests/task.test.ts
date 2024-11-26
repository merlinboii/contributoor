import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { MvpContributoor } from '../target/types/mvp_contributoor';
import { expect } from 'chai';

// Helper function to register a contributor
async function registerContributor(
  program: Program<MvpContributoor>,
  provider: anchor.AnchorProvider,
  contributor: anchor.web3.Keypair, // Accept a Keypair as an argument
  contributorName: string
): Promise<PublicKey> { // Return only the contributor PDA

  // Derive the PDA for the contributor
  const [contributorPDA] = await PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('contributor-info'),
      contributor.publicKey.toBuffer(),
    ],
    program.programId
  );

  const [nameRegistryPDA] = await PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('contributor-name'),
      anchor.utils.bytes.utf8.encode(contributorName),
    ],
    program.programId
  );

  // Register the contributor
  await program.methods
    .registerContributor(contributorName)
    .accounts({
      user: contributor.publicKey,
      contributor: contributorPDA,
      nameRegistry: nameRegistryPDA,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([contributor])
    .rpc();

  return contributorPDA; // Return the contributor PDA
}

describe('Task Tests', async () => {
  // Initialize the provider and program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.MvpContributoor as Program<MvpContributoor>;

  // Test state variables
  let projectPDA: PublicKey;
  let projectOwner: anchor.web3.Keypair;
  let contributor: anchor.web3.Keypair;
  let contributorPDA: PublicKey;

  before(async () => {
    // Generate keypairs
    projectOwner = anchor.web3.Keypair.generate();
    contributor = anchor.web3.Keypair.generate();

    // Airdrop SOL to accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(projectOwner.publicKey, 1000000000),
      "confirmed"
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(contributor.publicKey, 1000000000),
      "confirmed"
    );

    // Setup project
    const [_projectPDA] = await PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('project-info'),
        projectOwner.publicKey.toBuffer(),
      ],
      program.programId
    );
    projectPDA = _projectPDA;

    // Register project
    await program.methods
      .registerProject('TestProject', 'A test project')
      .accounts({
        user: projectOwner.publicKey,
        project: projectPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([projectOwner])
      .rpc();

    // Setup contributor
    const [_contributorPDA] = await PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('contributor-info'),
        contributor.publicKey.toBuffer(),
      ],
      program.programId
    );
    contributorPDA = _contributorPDA;

    const [nameRegistryPDA] = await PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('contributor-name'),
        anchor.utils.bytes.utf8.encode('testContributor'),
      ],
      program.programId
    );

    // Register contributor
    await program.methods
      .registerContributor('testContributor')
      .accounts({
        user: contributor.publicKey,
        contributor: contributorPDA,
        nameRegistry: nameRegistryPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([contributor])
      .rpc();
  });

  describe('Task Creation', async () => {
    it('Creates a task successfully', async () => {
      const project = await program.account.project.fetch(projectPDA);
      const counter = project.taskCounter;

      const [taskPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-info'),
          projectPDA.toBuffer(),
          counter.toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );

      await program.methods
        .createTask('TestTask', 'Test task description', 3600)
        .accounts({
          user: projectOwner.publicKey,
          project: projectPDA,
          task: taskPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([projectOwner])
        .rpc();

      const taskAccount = await program.account.task.fetch(taskPDA);
      expect(taskAccount.name).to.equal('TestTask');
      expect(taskAccount.description).to.equal('Test task description');
      expect(JSON.stringify(taskAccount.status)).to.equal(JSON.stringify({ open: {} }));
      expect(taskAccount.project.equals(projectPDA)).to.be.true;
      expect(taskAccount.assignee).to.be.null;
    });

    it('Prevents non-owner from creating tasks', async () => {
      const nonOwner = anchor.web3.Keypair.generate();
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(nonOwner.publicKey, 1000000000),
        "confirmed"
      );

      const project = await program.account.project.fetch(projectPDA);
      const counter = project.taskCounter;

      const [taskPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-info'),
          projectPDA.toBuffer(),
          counter.toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );

      try {
        await program.methods
          .createTask('UnauthorizedTask', 'Should fail', 3600)
          .accounts({
            user: nonOwner.publicKey,
            project: projectPDA,
            task: taskPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([nonOwner])
          .rpc();
        expect.fail('Should have thrown error');
      } catch (error: any) {
        const err = anchor.AnchorError.parse(error.logs);
        expect(err.error.errorCode.code).to.equal('WrongPrivileges');
      }
    });
  });
  
  describe('Task Update', async () => {
    let taskPDA: PublicKey;
  
    beforeEach(async () => {
      const project = await program.account.project.fetch(projectPDA);
      const counter = project.taskCounter;
  
      const [_taskPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-info'),
          projectPDA.toBuffer(),
          counter.toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );
      taskPDA = _taskPDA;
  
      await program.methods
        .createTask('OriginalTest', 'Test task for update', 3600)
        .accounts({
          user: projectOwner.publicKey,
          project: projectPDA,
          task: taskPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([projectOwner])
        .rpc();
    });
  
    it('Allows owner to update task info successfully', async () => {
      const taskAccount = await program.account.task.fetch(taskPDA);
      const taskId = taskAccount.uuid;

      await program.methods
        .updateTaskInfo(taskId, 'UpdatedTask', 'Updated task description')
        .accounts({
          user: projectOwner.publicKey,
          project: projectPDA,
          task: taskPDA,
        })
        .signers([projectOwner])
        .rpc();
      
      const taskAccountAfter = await program.account.task.fetch(taskPDA);
      expect(taskAccountAfter.name).to.equal('UpdatedTask');
      expect(taskAccountAfter.description).to.equal('Updated task description');
      expect(taskAccount.duration).to.equal(3600);
    });

      
    it('Allows owner to update task duration successfully', async () => {
      const taskAccount = await program.account.task.fetch(taskPDA);
      const taskId = taskAccount.uuid;

      await program.methods
        .updateTaskDuration(taskId, 7200)
        .accounts({
          user: projectOwner.publicKey,
          project: projectPDA,
          task: taskPDA,
        })
        .signers([projectOwner])
        .rpc();
      
      const taskAccountAfter = await program.account.task.fetch(taskPDA);
      expect(taskAccountAfter.duration).to.equal(7200);
      expect(taskAccountAfter.name).to.equal('OriginalTest');
      expect(taskAccountAfter.description).to.equal('Test task for update');
    });
  
    it('Prevents non-owner from updating task', async () => {
      const taskAccount = await program.account.task.fetch(taskPDA);
      const taskId = taskAccount.uuid;

      const nonOwner = anchor.web3.Keypair.generate();
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(nonOwner.publicKey, 1000000000),
        "confirmed"
      );
  
      try {
        await program.methods
          .updateTaskInfo(taskId, 'UnauthorizedUpdate', 'Should fail')
          .accounts({
            user: nonOwner.publicKey,
            project: projectPDA,
            task: taskPDA,
          })
          .signers([nonOwner])
          .rpc();
        expect.fail('Should have thrown error');
      } catch (error: any) {
        const err = anchor.AnchorError.parse(error.logs);
        expect(err.error.errorCode.code).to.equal('UnauthorizedAccess');
      }
    });

    it('Prevents owner from updating task when claimed', async () => {
      const taskAccount = await program.account.task.fetch(taskPDA);
      const taskId = taskAccount.uuid;
  
      // Claim the task
      const [taskAssignmentPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-assignment'),
          taskPDA.toBuffer(),
          contributor.publicKey.toBuffer()
        ],
        program.programId
      );
  
      await program.methods
        .claimTask(taskId)
        .accounts({
          user: contributor.publicKey,
          project: projectPDA,
          task: taskPDA,
          taskAssignment: taskAssignmentPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([contributor])
        .rpc();
  
      // Attempt to update the task info
      try {
        await program.methods
          .updateTaskInfo(taskId, 'UnauthorizedUpdate', 'Should fail')
          .accounts({
            user: projectOwner.publicKey,
            project: projectPDA,
            task: taskPDA,
          })
          .signers([projectOwner])
          .rpc();
        expect.fail('Should have thrown error');
      } catch (error: any) {
        const err = anchor.AnchorError.parse(error.logs);
        expect(err.error.errorCode.code).to.equal('TaskNotOpenOrBeingClaimed');
      }

      // Attempt to update the task duration
      try {
        await program.methods
          .updateTaskDuration(taskId, 7200)
          .accounts({
            user: projectOwner.publicKey,
            project: projectPDA,
            task: taskPDA,
          })
          .signers([projectOwner])
          .rpc();
        expect.fail('Should have thrown error');
      } catch (error: any) {
        const err = anchor.AnchorError.parse(error.logs);
        expect(err.error.errorCode.code).to.equal('TaskNotOpenOrBeingClaimed');
      }
    });
  });

  describe('Task Assignment', async () => {
    let taskPDA: PublicKey;
    
    beforeEach(async () => {
      const project = await program.account.project.fetch(projectPDA);
      const counter = project.taskCounter;

      const [_taskPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-info'),
          projectPDA.toBuffer(),
          counter.toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );
      taskPDA = _taskPDA;

      // Create the task
      await program.methods
        .createTask('AssignmentTest', 'Test task for assignment', 3600)
        .accounts({
          user: projectOwner.publicKey,
          project: projectPDA,
          task: taskPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([projectOwner])
        .rpc();
    });

    it('Assigns task to contributor successfully', async () => {
      const taskAccount = await program.account.task.fetch(taskPDA);
      const taskId = taskAccount.uuid;

      const [taskAssignmentPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-assignment'),
          taskPDA.toBuffer(),
          contributor.publicKey.toBuffer()
        ],
        program.programId
      );

      const [contributorPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('contributor-info'),
          contributor.publicKey.toBuffer(),
        ],
        program.programId
      );

      const contributorAccount = await program.account.contributor.fetch(contributorPDA);


      await program.methods
        .claimTask(taskId)
        .accounts({
          user: contributor.publicKey,
          project: projectPDA,
          task: taskPDA,
          taskAssignment: taskAssignmentPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([contributor])
        .rpc();
  

      const taskAccountAfter = await program.account.task.fetch(taskPDA);
      const contributorAccountAfter = await program.account.contributor.fetch(contributorPDA);

      expect(contributorAccountAfter.tasksProcess.toNumber()).to.eq(contributorAccount.tasksProcess.toNumber() + 1);
      expect(contributorAccountAfter.tasksCompleted.toNumber()).to.eq(contributorAccount.tasksCompleted.toNumber());
      expect(contributorAccountAfter.tasksFailed.toNumber()).to.eq(contributorAccount.tasksFailed.toNumber());
      expect(taskAccountAfter.assignee.toString()).to.equal(contributor.publicKey.toString());
      expect(JSON.stringify(taskAccountAfter.status)).to.equal(JSON.stringify({ claimed: {} }));
    });

    it('Prevents claiming an already claimed task', async () => {
      const taskAccount = await program.account.task.fetch(taskPDA);
      const taskId = taskAccount.uuid;
  
      const [taskAssignmentPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-assignment'),
          taskPDA.toBuffer(),
          contributor.publicKey.toBuffer()
        ],
        program.programId
      );
  
      await program.methods
        .claimTask(taskId)
        .accounts({
          user: contributor.publicKey,
          project: projectPDA,
          task: taskPDA,
          taskAssignment: taskAssignmentPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([contributor])
        .rpc();
  
      const anotherContributor = anchor.web3.Keypair.generate();
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(anotherContributor.publicKey, 1000000000),
        "confirmed"
      );
  
      // Register another contributor
      await registerContributor(
        program,
        provider,
        anotherContributor,
        'AnotherContributor'
      );

      const [taskAssignmentPDAanotherContributor] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-assignment'),
          taskPDA.toBuffer(),
          anotherContributor.publicKey.toBuffer()
        ],
        program.programId
      );

      try {
        await program.methods
          .claimTask(taskId)
          .accounts({
            user: anotherContributor.publicKey,
            project: projectPDA,
            task: taskPDA,
            taskAssignment: taskAssignmentPDAanotherContributor,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([anotherContributor])
          .rpc();
        expect.fail('Should have thrown error');
      } catch (error: any) {
        const err = anchor.AnchorError.parse(error.logs);
        expect(err.error.errorCode.code).to.equal('TaskNotOpenOrBeingClaimed');
      }
    });
  });

  describe('Task Submission', async () => {
    let taskPDA: PublicKey;
    let taskAssignmentPDA: PublicKey;
    let taskAccount: any;

    beforeEach(async () => {
      const project = await program.account.project.fetch(projectPDA);
      const counter = project.taskCounter;

      const [_taskPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-info'),
          projectPDA.toBuffer(),
          counter.toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );
      taskPDA = _taskPDA;

      await program.methods
        .createTask('SubmissionTest', 'Test task for submission', 3600)
        .accounts({
          user: projectOwner.publicKey,
          project: projectPDA,
          task: taskPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([projectOwner])
        .rpc();

      const [_taskAssignmentPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-assignment'),
          taskPDA.toBuffer(),
          contributor.publicKey.toBuffer()
        ],
        program.programId
      );
      taskAssignmentPDA = _taskAssignmentPDA;

      taskAccount = await program.account.task.fetch(taskPDA);

      await program.methods
        .claimTask(taskAccount.uuid)
        .accounts({
          user: contributor.publicKey,
          project: projectPDA,
          task: taskPDA,
          taskAssignment: taskAssignmentPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([contributor])
        .rpc();
    });

    it('Allows assignee to submit task successfully', async () => {
      await program.methods
        .submitTask(taskAccount.uuid)
        .accounts({
          user: contributor.publicKey,
          project: projectPDA,
          task: taskPDA,
          taskAssignment: taskAssignmentPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([contributor])
        .rpc();

      const taskAccountAfter = await program.account.task.fetch(taskPDA);
      expect(JSON.stringify(taskAccountAfter.status)).to.equal(JSON.stringify({ submitted: {} }));
    });

    it('Prevents non-assignee from submitting task', async () => {
      // Setup for unauthorize assignee
      const project = await program.account.project.fetch(projectPDA);
      const counter = project.taskCounter;

      const [_taskPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-info'),
          projectPDA.toBuffer(),
          counter.toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );

      await program.methods
        .createTask('SubmissionTest-2', 'Test task for submission', 3600)
        .accounts({
          user: projectOwner.publicKey,
          project: projectPDA,
          task: _taskPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([projectOwner])
        .rpc();

      const nonAssignee = anchor.web3.Keypair.generate();
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(nonAssignee.publicKey, 1000000000),
        "confirmed"
      );

      await registerContributor(
        program,
        provider,
        nonAssignee,
        'nonAssignee'
      );

      const [taskAssignmentPDAnonAssignee] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-assignment'),
          _taskPDA.toBuffer(),
          nonAssignee.publicKey.toBuffer()
        ],
        program.programId
      );

      const _taskAccount = await program.account.task.fetch(_taskPDA);

      await program.methods
        .claimTask(_taskAccount.uuid)
        .accounts({
          user: nonAssignee.publicKey,
          project: projectPDA,
          task: _taskPDA,
          taskAssignment: taskAssignmentPDAnonAssignee,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([nonAssignee])
        .rpc();

      // Attempt to submit for others task
      try {
        await program.methods
          .submitTask(taskAccount.uuid)
          .accounts({
            user: nonAssignee.publicKey,
            project: projectPDA,
            task: taskPDA,
            taskAssignment: taskAssignmentPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([nonAssignee])
          .rpc();
        expect.fail('Should have thrown error');
      } catch (error: any) {
        const err = anchor.AnchorError.parse(error.logs);
        expect(err.error.errorCode.code).to.equal('NotTaskAssignee');
      }
    });
  });

  describe('Task Approval and Rejection', async () => {
    let taskPDA: PublicKey;
    let taskAssignmentPDA: PublicKey;
    let taskAccount: any;

    beforeEach(async () => {
      const project = await program.account.project.fetch(projectPDA);
      const counter = project.taskCounter;

      const [_taskPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-info'),
          projectPDA.toBuffer(),
          counter.toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );
      taskPDA = _taskPDA;

      await program.methods
        .createTask('ApprovalTest', 'Test task for approval', 3600)
        .accounts({
          user: projectOwner.publicKey,
          project: projectPDA,
          task: taskPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([projectOwner])
        .rpc();

      const [_taskAssignmentPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('task-assignment'),
          taskPDA.toBuffer(),
          contributor.publicKey.toBuffer()
        ],
        program.programId
      );
      taskAssignmentPDA = _taskAssignmentPDA;

      // Fetch the task account after creation to get the uuid
      taskAccount= await program.account.task.fetch(taskPDA);

      await program.methods
        .claimTask(taskAccount.uuid)
        .accounts({
          user: contributor.publicKey,
          project: projectPDA,
          task: taskPDA,
          taskAssignment: taskAssignmentPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([contributor])
        .rpc();

      await program.methods
        .submitTask(taskAccount.uuid)
        .accounts({
          user: contributor.publicKey,
          project: projectPDA,
          task: taskPDA,
          taskAssignment: taskAssignmentPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([contributor])
        .rpc();
    });

    it('Allows owner to approve task successfully', async () => {
      const [contributorPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('contributor-info'),
          contributor.publicKey.toBuffer(),
        ],
        program.programId
      );

      const contributorAccount = await program.account.contributor.fetch(contributorPDA);

      await program.methods
        .approveTask(taskAccount.uuid)
        .accounts({
          user: projectOwner.publicKey,
          project: projectPDA,
          task: taskPDA,
          taskAssignment: taskAssignmentPDA,
          contributor: contributorPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([projectOwner])
        .rpc();

      const contributorAccountAfter = await program.account.contributor.fetch(contributorPDA);
      expect(contributorAccountAfter.tasksProcess.toNumber()).to.eq(contributorAccount.tasksProcess.toNumber() - 1);
      expect(contributorAccountAfter.tasksCompleted.toNumber()).to.eq(contributorAccount.tasksCompleted.toNumber() + 1);
      expect(contributorAccountAfter.tasksFailed.toNumber()).to.eq(contributorAccount.tasksFailed.toNumber());

      const taskAccountAfter = await program.account.task.fetch(taskPDA);
      expect(JSON.stringify(taskAccountAfter.status)).to.equal(JSON.stringify({ completed: {} }));
    });

    it('Prevents non-owner from approving task', async () => {
      const nonOwner = anchor.web3.Keypair.generate();
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(nonOwner.publicKey, 1000000000),
        "confirmed"
      );

      try {
        await program.methods
          .approveTask(taskAccount.uuid)
          .accounts({
            user: nonOwner.publicKey,
            project: projectPDA,
            task: taskPDA,
            taskAssignment: taskAssignmentPDA,
            contributor: contributorPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([nonOwner])
          .rpc();
        expect.fail('Should have thrown error');
      } catch (error: any) {
        const err = anchor.AnchorError.parse(error.logs);
        expect(err.error.errorCode.code).to.equal('UnauthorizedAccess');
      }
    });

    it('Allows owner to reject task successfully', async () => {
      const [contributorPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('contributor-info'),
          contributor.publicKey.toBuffer(),
        ],
        program.programId
      );

      const contributorAccount = await program.account.contributor.fetch(contributorPDA);

      await program.methods
        .rejectTask(taskAccount.uuid)
        .accounts({
          user: projectOwner.publicKey,
          project: projectPDA,
          task: taskPDA,
          taskAssignment: taskAssignmentPDA,
          contributor: contributorPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([projectOwner])
        .rpc();
      
      const contributorAccountAfter = await program.account.contributor.fetch(contributorPDA);
      expect(contributorAccountAfter.tasksProcess.toNumber()).to.eq(contributorAccount.tasksProcess.toNumber() - 1);
      expect(contributorAccountAfter.tasksCompleted.toNumber()).to.eq(contributorAccount.tasksCompleted.toNumber());
      expect(contributorAccountAfter.tasksFailed.toNumber()).to.eq(contributorAccount.tasksFailed.toNumber() + 1);

      const taskAccountAfter = await program.account.task.fetch(taskPDA);
      expect(JSON.stringify(taskAccountAfter.status)).to.equal(JSON.stringify({ open: {} }));
    });

    it('Prevents non-owner from rejecting task', async () => {
      const nonOwner = anchor.web3.Keypair.generate();
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(nonOwner.publicKey, 1000000000),
        "confirmed"
      );

      try {
        await program.methods
          .rejectTask(taskAccount.uuid)
          .accounts({
            user: nonOwner.publicKey,
            project: projectPDA,
            task: taskPDA,
            taskAssignment: taskAssignmentPDA,
            contributor: contributorPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([nonOwner])
          .rpc();
        expect.fail('Should have thrown error');
      } catch (error: any) {
        const err = anchor.AnchorError.parse(error.logs);
        expect(err.error.errorCode.code).to.equal('UnauthorizedAccess');
      }
    });
  });
}); 