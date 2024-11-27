// Anchor
import { Program, AnchorProvider, setProvider, BN } from "@coral-xyz/anchor";
import idl from "../components/mvp_contributoor.json";

// Solana
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { MvpContributoor } from "../components/mvp_contributoor";

// Utils
import { getProjectAccountByPublicKey } from "./projectUtils";
import { TaskStatus } from "./enum";
import { getContributorAccountByPublicKey } from "./contributorUtils";

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new PublicKey(idl.address);

const DAY_IN_SECONDS = 24 * 60 * 60;

const getProvider = (connection: any, wallet: any) => {
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    setProvider(provider);
    return provider;
};

export const getStatusIcon = (status: string): string => {
    switch (status) {
      case TaskStatus.Open:
        return "Open";
      case TaskStatus.Claimed:
        return "Claimed";
      case TaskStatus.Submitted:
        return "Submitted";
      case TaskStatus.Completed:
        return "Completed";
      default:
        return "Unknown";
    }
  }
  
export const getStatusColor = (status: string) => {
    switch (status) {
      case TaskStatus.Open: return "default";
      case TaskStatus.Claimed: return "primary";
      case TaskStatus.Submitted: return "warning";
      case TaskStatus.Completed: return "success";
      default: return "default";
    }
  }

export const daysToSeconds = (duration: number) => {
    return duration * DAY_IN_SECONDS;
}

export const secondsToDays = (seconds: number) => {
    return Math.round(seconds / DAY_IN_SECONDS);
}

export const getTaskAccountByPublicKey = async (projectPDA: PublicKey, taskID: any): Promise<any> => {
    try {        
        const [taskPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("task-info"), projectPDA.toBuffer(), taskID.toArrayLike(Buffer, 'le', 8)],
            programID
        );

        return taskPDA;
    } catch (error) {
        console.error("Error fetching task account:", error);
        return null;
    }
}

export const getTaskAssignmentAccountByPublicKey = async (taskPDA: PublicKey, assignee: PublicKey): Promise<any> => {
    try {
        const [taskAssignmentPDA] = await PublicKey.findProgramAddressSync(
            [
                Buffer.from('task-assignment'),
                taskPDA.toBuffer(),
                assignee.toBuffer(),
            ],
            programID
        );

        return taskAssignmentPDA;
    } catch (error) {
        console.error("Error fetching task assignment account:", error);
        return null;
    }
}

export const createTask = async (ownerKey: PublicKey, wallet: any, connection: any, name: string, description: string, duration: number): Promise<any> => {
    const anchProvider = getProvider(connection, wallet);
    const program = new Program<MvpContributoor>(idl_object, anchProvider);
        
    const projectPDA = await getProjectAccountByPublicKey(wallet, ownerKey, connection);
    const project = await program.account.project.fetch(projectPDA);
    const counter = project.taskCounter;

    const [taskPDA] = await PublicKey.findProgramAddressSync(
        [
            Buffer.from('task-info'),
            projectPDA.toBuffer(),
            counter.toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
    );

    const createTaskAccounts = {
        user: anchProvider.publicKey,
        project: projectPDA,
        task: taskPDA,
        systemProgram: SystemProgram.programId,
    };

    const signature = await program.methods.createTask(
        name,
        description,
        duration,
    ).accounts(createTaskAccounts).rpc();

    return signature;
}

export const updateTaskInfo = async (wallet: any, ownerKey: any, connection: any, taskPDA: any, taskId: any, name: string, description: string): Promise<any> => {
    const anchProvider = getProvider(connection, wallet);
    const program = new Program<MvpContributoor>(idl_object, anchProvider);
  
    const projectPDA = await getProjectAccountByPublicKey(wallet, ownerKey, connection);

    const updateTaskInfoAccounts = {
        user: anchProvider.publicKey,
        project: projectPDA,
        task: taskPDA,
        systemProgram: SystemProgram.programId,
    };

    const signature = await program.methods.updateTaskInfo(
          new BN(taskId),
          name,
          description
      ).accounts(updateTaskInfoAccounts).rpc();

    return signature;
}

export const updateTaskDuration = async (wallet: any, ownerKey: any, connection: any, taskPDA: any, taskId: any, duration: number): Promise<any> => {
    const anchProvider = getProvider(connection, wallet);
    const program = new Program<MvpContributoor>(idl_object, anchProvider);
  
    const projectPDA = await getProjectAccountByPublicKey(wallet, ownerKey, connection);
    
    const updateTaskDurationAccounts = {
        user: anchProvider.publicKey,
        project: projectPDA,
        task: taskPDA,
        systemProgram: SystemProgram.programId,
    };

    const signature = await program.methods.updateTaskDuration(
          new BN(taskId),
          daysToSeconds(duration)
      ).accounts(updateTaskDurationAccounts).rpc();

    return signature;
}

export const approveTask = async (wallet: any, ownerKey: PublicKey, connection: any, taskPDA: PublicKey, assignee: PublicKey, taskId: any): Promise<any> => {
    const anchProvider = getProvider(connection, wallet);
    const program = new Program<MvpContributoor>(idl_object, anchProvider);
      
    const projectPDA = await getProjectAccountByPublicKey(wallet, ownerKey, connection);
    const taskAssignmentPDA = await getTaskAssignmentAccountByPublicKey(taskPDA, assignee);
    const contributorPDA = await getContributorAccountByPublicKey(wallet, assignee, connection);

    const approveTaskAccounts = {
        user: anchProvider.publicKey,
        project: projectPDA,
        task: taskPDA,
        taskAssignment: taskAssignmentPDA,
        contributor: contributorPDA,
        systemProgram: SystemProgram.programId,
    };

    const signature = await program.methods.approveTask(
        new BN(taskId),
    ).accounts(approveTaskAccounts).rpc();

    return signature;
}

export const rejectTask = async (wallet: any, ownerKey: PublicKey, connection: any, taskPDA: PublicKey, assignee: PublicKey, taskId: any): Promise<any> => {
    const anchProvider = getProvider(connection, wallet);
    const program = new Program<MvpContributoor>(idl_object, anchProvider);
      
    const projectPDA = await getProjectAccountByPublicKey(wallet, ownerKey, connection);
    const taskAssignmentPDA = await getTaskAssignmentAccountByPublicKey(taskPDA, assignee);
    const contributorPDA = await getContributorAccountByPublicKey(wallet, assignee, connection);

    const rejectTaskAccounts = {
        user: anchProvider.publicKey,
        project: projectPDA,
        task: taskPDA,
        taskAssignment: taskAssignmentPDA,
        contributor: contributorPDA,
        systemProgram: SystemProgram.programId,
    };

    const signature = await program.methods.rejectTask(
        new BN(taskId),
    ).accounts(rejectTaskAccounts).rpc();

    return signature;
}

export const claimTask = async (wallet: any, projectOwnerKey: PublicKey, connection: any, taskPDA: PublicKey, taskId: any): Promise<any> => {
    const anchProvider = getProvider(connection, wallet);
    const program = new Program<MvpContributoor>(idl_object, anchProvider);
    
    const projectPDA = await getProjectAccountByPublicKey(wallet, projectOwnerKey, connection);
    const taskAssignmentPDA = await getTaskAssignmentAccountByPublicKey(taskPDA, anchProvider.publicKey);
    
    const claimTaskAccounts = {
        user: anchProvider.publicKey,
        project: projectPDA,
        task: taskPDA,
        taskAssignment: taskAssignmentPDA,
        systemProgram: SystemProgram.programId,
    };

    const signature = await program.methods.claimTask(
        new BN(taskId),
    ).accounts(claimTaskAccounts).rpc();

    return signature;
}

export const submitTask = async (wallet: any, projectOwnerKey: PublicKey, connection: any, taskPDA: PublicKey, taskId: any): Promise<any> => {
    const anchProvider = getProvider(connection, wallet);
    const program = new Program<MvpContributoor>(idl_object, anchProvider);
    
    const projectPDA = await getProjectAccountByPublicKey(wallet, projectOwnerKey, connection);
    const taskAssignmentPDA = await getTaskAssignmentAccountByPublicKey(taskPDA, anchProvider.publicKey);
    
    const submitTaskAccounts = {
        user: anchProvider.publicKey,
        project: projectPDA,
        task: taskPDA,
        taskAssignment: taskAssignmentPDA,
        systemProgram: SystemProgram.programId,
    };

    const signature = await program.methods.submitTask(
        new BN(taskId),
    ).accounts(submitTaskAccounts).rpc();

    return signature;
}