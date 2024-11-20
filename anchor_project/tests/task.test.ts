import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { MvpContributoor } from '../target/types/mvp_contributoor';
import { expect } from 'chai';

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
          projectOwner.publicKey.toBuffer(),
          projectPDA.toBuffer(),
          counter.toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );

      await program.methods
        .createTask('TestTask', 'Test task description')
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
          projectOwner.publicKey.toBuffer(),
          projectPDA.toBuffer(),
          counter.toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );

      try {
        await program.methods
          .createTask('UnauthorizedTask', 'Should fail')
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

//   describe('Task Assignment', async () => {
//     let taskPDA: PublicKey;

//     beforeEach(async () => {
//       // Create a new task for each test
//       const project = await program.account.project.fetch(projectPDA);
//       const counter = project.taskCounter;

//       const [_taskPDA] = await PublicKey.findProgramAddressSync(
//         [
//           anchor.utils.bytes.utf8.encode('task-info'),
//           projectOwner.publicKey.toBuffer(),
//           projectPDA.toBuffer(),
//           counter.toArrayLike(Buffer, 'le', 8)
//         ],
//         program.programId
//       );
//       taskPDA = _taskPDA;

//       await program.methods
//         .createTask('AssignmentTest', 'Test task for assignment')
//         .accounts({
//           user: projectOwner.publicKey,
//           project: projectPDA,
//           task: taskPDA,
//           systemProgram: anchor.web3.SystemProgram.programId,
//         })
//         .signers([projectOwner])
//         .rpc();
//     });

//     it('Assigns task to contributor successfully', async () => {
//       await program.methods
//         .assignTask()
//         .accounts({
//           user: contributor.publicKey,
//           project: projectPDA,
//           task: taskPDA,
//           contributor: contributorPDA,
//           systemProgram: anchor.web3.SystemProgram.programId,
//         })
//         .signers([contributor])
//         .rpc();

//       const taskAccount = await program.account.task.fetch(taskPDA);
//       expect(taskAccount.assignee.toString()).to.equal(contributorPDA.toString());
//       expect(taskAccount.status).to.equal(1); // IN_PROGRESS
//     });

//     it('Prevents assigning already assigned task', async () => {
//       // First assignment
//       await program.methods
//         .assignTask()
//         .accounts({
//           user: contributor.publicKey,
//           project: projectPDA,
//           task: taskPDA,
//           contributor: contributorPDA,
//           systemProgram: anchor.web3.SystemProgram.programId,
//         })
//         .signers([contributor])
//         .rpc();

//       // Create another contributor
//       const contributor2 = anchor.web3.Keypair.generate();
//       await provider.connection.confirmTransaction(
//         await provider.connection.requestAirdrop(contributor2.publicKey, 1000000000),
//         "confirmed"
//       );

//       try {
//         await program.methods
//           .assignTask()
//           .accounts({
//             user: contributor2.publicKey,
//             project: projectPDA,
//             task: taskPDA,
//             contributor: contributorPDA,
//             systemProgram: anchor.web3.SystemProgram.programId,
//           })
//           .signers([contributor2])
//           .rpc();
//         expect.fail('Should have thrown error');
//       } catch (error: any) {
//         const err = anchor.AnchorError.parse(error.logs);
//         expect(err.error.errorCode.code).to.equal('TaskAlreadyAssigned');
//       }
//     });
//   });
}); 