// Import required modules from Anchor and Solana's web3.js.
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { MvpContributoor } from '../target/types/mvp_contributoor';
import { expect, assert } from 'chai';

// Define a test suite for the MvpContributoor program.
describe('Register Test', async () => {
  // Initialize the provider to interact with the Solana network.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Reference the deployed MvpContributoor program for testing.
  const program = anchor.workspace.MvpContributoor as Program<MvpContributoor>;

  // Test 1: Basic registration
  it('Registers a contributor successfully', async () => {
    let user = anchor.web3.Keypair.generate();  // Generate new keypair
    
    // Airdrop some SOL to the user
    await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(user.publicKey, 1000000000),
        "confirmed"
    );

    const contributorName = "merlinboii";
    
    // Find the Program Derived Address (PDA) for the contributor account
    const [contributorPDA, _] = await PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('contributor-info'),
            user.publicKey.toBuffer(),  // Use user's public key
        ],
        program.programId
    );

    const [nameRegistryPDA, __] = await PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('contributor-name'),
            anchor.utils.bytes.utf8.encode(contributorName),
        ],
        program.programId
    );

    // Create contributor account
    await program.methods
        .registerContributor(contributorName)
        .accounts({
            user: user.publicKey,  // Use user's public key
            contributor: contributorPDA,
            nameRegistry: nameRegistryPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])  // Add user as signer
        .rpc();

    // Verify the registration
    const contributorAccount = await program.account.contributor.fetch(contributorPDA);
    expect(contributorAccount.name).to.equal('merlinboii');
    expect(contributorAccount.tasksCompleted.toNumber()).to.equal(0);
    expect(contributorAccount.tasksFailed.toNumber()).to.equal(0);
  });

  // Test 2: Same user, different name
  it("Cannot register the same contributor twice", async () => {
    let user = anchor.web3.Keypair.generate();  // Generate new keypair
    
    // Airdrop some SOL to the user
    await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(user.publicKey, 1000000000),
        "confirmed"
    );

    const contributorName = "merlinboii-1";
    const secondName = "merlinboii-2";
    
    // First registration
    const [contributorPDA, _] = await PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('contributor-info'),
            user.publicKey.toBuffer(),  // Use user's public key
        ],
        program.programId
    );

    const [nameRegistryPDA, __] = await PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('contributor-name'),
            anchor.utils.bytes.utf8.encode(contributorName),
        ],
        program.programId
    );

    // First registration
    await program.methods
        .registerContributor(contributorName)
        .accounts({
            user: user.publicKey,  // Use user's public key
            contributor: contributorPDA,
            nameRegistry: nameRegistryPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])  // Add user as signer
        .rpc();

    // Try second registration
    const [secondNameRegistryPDA, ___] = await PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('contributor-name'),
            anchor.utils.bytes.utf8.encode(secondName),
        ],
        program.programId
    );
    
    let flag = "should be failed"
    try {
        await program.methods
            .registerContributor(secondName)
            .accounts({
                user: user.publicKey,  // Use user's public key
                contributor: contributorPDA,
                nameRegistry: secondNameRegistryPDA,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([user])  // Add user as signer
            .rpc();
    } catch (error: any) {
        if (error.logs) {
            flag = "Failed";
            const logs = error.logs;
            expect(logs.some(log => log.includes("already in use"))).to.be.true;
        }
    }
    expect(flag).to.equal("Failed");
  });

  // Test 3: Different user, same name
  it("Cannot register the same contributor name twice", async () => {
    const Alice = anchor.web3.Keypair.generate();
    const Bob = anchor.web3.Keypair.generate();
    
    // Airdrop to Alice & Bob
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(Alice.publicKey, 1000000000),
      "confirmed"
    );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(Bob.publicKey, 1000000000),
      "confirmed"
    );

    const contributorName = "uniqueName3";  // Same name that both will try to use
    
    // First user (Alice) registration PDAs
    const [aliceContributorPDA, _] = await PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('contributor-info'),
        Alice.publicKey.toBuffer(),
      ],
      program.programId
    );

    const [nameRegistryPDA, __] = await PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('contributor-name'),
        anchor.utils.bytes.utf8.encode(contributorName),
      ],
      program.programId
    );

    // First registration (Alice)
    await program.methods
      .registerContributor(contributorName)
      .accounts({
        user: Alice.publicKey,
        contributor: aliceContributorPDA,
        nameRegistry: nameRegistryPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([Alice])
      .rpc();

    // Second user (Bob) tries to register with same name
    const [bobContributorPDA, ___] = await PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('contributor-info'),
        Bob.publicKey.toBuffer(),
      ],
      program.programId
    );
    
    let flag = "should be failed"
    try {
      await program.methods
        .registerContributor(contributorName)
        .accounts({
          user: Bob.publicKey,
          contributor: bobContributorPDA,
          nameRegistry: nameRegistryPDA,  // Same nameRegistry as it's the same name
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([Bob])
        .rpc();
    } catch (error: any) {
      flag = "Failed";
      const logs = error.logs;
      expect(logs.some(log => log.includes("already in use"))).to.be.true;
    }
    expect(flag).to.equal("Failed");
  });

  it('Registers a project successfully', async () => {
    // Find the Program Derived Address (PDA) for the contributor account.
    const [projectPDA, _] = await PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('project-info'), // Encode the seed for the PDA.
        provider.wallet.publicKey.toBuffer(), // Include the public key of the wallet as part of the seed.
      ],
      program.programId // Specify the program ID used for generating the PDA.
    );

    // Create user stats with the name 'brian'.
    await program.methods
      .registerProject('ContributoorLab', 'ContributoorLab Project for test')
      .accounts({
        user: provider.wallet.publicKey,
        project: projectPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc(); // Perform the RPC call to execute the method on-chain.

    // Fetch the userStats account and assert that the name is correctly set to 'brian'.
    expect((await program.account.project.fetch(projectPDA)).name).to.equal('ContributoorLab');
    expect((await program.account.project.fetch(projectPDA)).description).to.equal('ContributoorLab Project for test');
    expect((await program.account.project.fetch(projectPDA)).owner.toBase58()).to.equal(provider.wallet.publicKey.toBase58());
    expect((await program.account.project.fetch(projectPDA)).taskIds).to.empty;

  });

  it('Cannot register the same project name twice', async () => {
    const Alice = anchor.web3.Keypair.generate();
    const Bob = anchor.web3.Keypair.generate();
    
    // Airdrop to Alice & Bob
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(Alice.publicKey, 1000000000),
      "confirmed"
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(Bob.publicKey, 1000000000),
      "confirmed"
    );

    const projectName = "UniqueProject";
    
    // First registration (Alice's project)
    const [aliceProjectPDA, _] = await PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('project-info'),
        Alice.publicKey.toBuffer(),
      ],
      program.programId
    );

    // Register Alice's project
    await program.methods
      .registerProject(projectName, 'First project description')
      .accounts({
        user: Alice.publicKey,
        project: aliceProjectPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([Alice])
      .rpc();

    // Try to register Bob's project with the same name
    const [bobProjectPDA, __] = await PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('project-info'),
        Bob.publicKey.toBuffer(),
      ],
      program.programId
    );
    
    let flag = "should be failed";
    try {
      await program.methods
        .registerProject(projectName, 'Second project description')
        .accounts({
          user: Bob.publicKey,
          project: bobProjectPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([Bob])
        .rpc();
    } catch (error: any) {
      flag = "Failed";
      const logs = error.logs;
      expect(logs.some(log => log.includes("already in use"))).to.be.true;
    }
    expect(flag).to.equal("Failed");
  });

  // // Test to verify task functionality.
  // describe('Task Operations Test', async () => {
  //   let projectPDA;
  //   let projectOwner = anchor.web3.Keypair.generate();

  //   before(async () => {
  //     await provider.connection.confirmTransaction(
  //       await provider.connection.requestAirdrop(projectOwner.publicKey, 1000000000),
  //       "confirmed"
  //     );

  //     const [_projectPDA, _] = await PublicKey.findProgramAddressSync(
  //       [
  //         anchor.utils.bytes.utf8.encode('project-info'),
  //         projectOwner.publicKey.toBuffer(),
  //       ],
  //       program.programId
  //     );

  //     projectPDA = _projectPDA;
      
  //     // Register the project first
  //     await program.methods
  //       .registerProject('ContributoorLab', 'ContributoorLab Project for test')
  //       .accounts({
  //         user: projectOwner.publicKey,
  //         project: projectPDA,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .signers([projectOwner])
  //       .rpc();
  //   });

  //   it('Create a task successfully', async () => {
  //     const project = await program.account.project.fetch(projectPDA);
  //     const counter = project.taskCounter;

  //     const [taskPDA, _] = await PublicKey.findProgramAddressSync(
  //       [
  //         anchor.utils.bytes.utf8.encode('task-info'),
  //         projectOwner.publicKey.toBuffer(),
  //         projectPDA.toBuffer(),
  //         counter.toArrayLike(Buffer, 'le', 8)
  //       ],
  //       program.programId
  //     );

  //     await program.methods
  //       .createTask('FirstContribute', 'Make your first contribution at ContributoorLab')
  //       .accounts({
  //         user: projectOwner.publicKey,
  //         project: projectPDA,
  //         task: taskPDA,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .signers([projectOwner])
  //       .rpc();
        
  //     // Verify task details
  //     const taskAccount = await program.account.task.fetch(taskPDA);
  //     expect(taskAccount.name).to.equal('FirstContribute');
  //     expect(taskAccount.description).to.equal('Make your first contribution at ContributoorLab');
  //     expect(taskAccount.uuid).to.equal(counter.toString());
  //     expect(taskAccount.status).to.equal(0); // Assuming 0 is OPEN status
  //     expect(taskAccount.project.equals(projectPDA)).to.be.true;
  //     expect(taskAccount.assignee).to.be.null;
      
  //     // Verify project counter increased and task was added to project
  //     const updatedProject = await program.account.project.fetch(projectPDA);
  //     expect(updatedProject.taskCounter.toString()).to.equal((counter.addn(1)).toString());
  //     expect(updatedProject.taskIds).to.include(taskPDA.toString());
  //   });

  //   it('Cannot create a task with non-project owner', async () => {
  //     const nonOwner = anchor.web3.Keypair.generate();
  //     await provider.connection.confirmTransaction(
  //       await provider.connection.requestAirdrop(nonOwner.publicKey, 1000000000),
  //       "confirmed"
  //     );

  //     const project = await program.account.project.fetch(projectPDA);
  //     const counter = project.taskCounter;

  //     const [taskPDA, _] = await PublicKey.findProgramAddressSync(
  //       [
  //         anchor.utils.bytes.utf8.encode('task-info'),
  //         projectOwner.publicKey.toBuffer(),
  //         projectPDA.toBuffer(),
  //         counter.toArrayLike(Buffer, 'le', 8)
  //       ],
  //       program.programId
  //     );

  //     let flag = "should fail";
  //     try {
  //       await program.methods
  //         .createTask('UnauthorizedTask', 'This should fail')
  //         .accounts({
  //           user: nonOwner.publicKey,
  //           project: projectPDA,
  //           task: taskPDA,
  //           systemProgram: anchor.web3.SystemProgram.programId,
  //         })
  //         .signers([nonOwner])
  //         .rpc();
  //     } catch (error: any) {
  //       flag = "Failed";
  //       const err = anchor.AnchorError.parse(error.logs);
  //       expect(err.error.errorCode.code).to.equal("WrongPrivileges");
  //     }
  //     expect(flag).to.equal("Failed");
  //   });

  //   it('Cannot create a task with duplicate name in same project', async () => {
  //     const project = await program.account.project.fetch(projectPDA);
  //     const counter = project.taskCounter;

  //     const [taskPDA, _] = await PublicKey.findProgramAddressSync(
  //       [
  //         anchor.utils.bytes.utf8.encode('task-info'),
  //         projectOwner.publicKey.toBuffer(),
  //         projectPDA.toBuffer(),
  //         counter.toArrayLike(Buffer, 'le', 8)
  //       ],
  //       program.programId
  //     );

  //     let flag = "should fail";
  //     try {
  //       await program.methods
  //         .createTask('FirstContribute', 'Duplicate task name')
  //         .accounts({
  //           user: projectOwner.publicKey,
  //           project: projectPDA,
  //           task: taskPDA,
  //           systemProgram: anchor.web3.SystemProgram.programId,
  //         })
  //         .signers([projectOwner])
  //         .rpc();
  //     } catch (error: any) {
  //       flag = "Failed";
  //       const err = anchor.AnchorError.parse(error.logs);
  //       expect(err.error.errorCode.code).to.equal("TaskNameTaken");
  //     }
  //     expect(flag).to.equal("Failed");
  //   });
  // });
});