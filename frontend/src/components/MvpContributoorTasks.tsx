import { verify } from '@noble/ed25519';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { FC, useCallback, useState, useEffect } from 'react';
import { notify } from "../utils/notifications";

import { Program, AnchorProvider, web3, utils, BN, setProvider } from "@coral-xyz/anchor"
import idl from "./mvp_contributoor.json"
import { MvpContributoor as MvpContributoorType } from "./mvp_contributoor"
import { PublicKey } from '@solana/web3.js';

const idl_string = JSON.stringify(idl)
const idl_object = JSON.parse(idl_string)
const programID = new PublicKey(idl.address)

export const MvpContributoorTasks: FC = () => {
    const ourWallet = useWallet();
    const { connection } = useConnection()
    const [openTasks, setOpenTasks] = useState([]); // Add this line

    const getProvider = () => {
        const provider = new AnchorProvider(connection, ourWallet, AnchorProvider.defaultOptions())
        setProvider(provider)
        return provider
    }

    const checkContributorExists = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program<MvpContributoorType>(idl_object, anchProvider);

            // Define seeds for contributor PDA
            const [contributorPDA] = await PublicKey.findProgramAddress(
                [Buffer.from("contributor-info"), anchProvider.publicKey.toBuffer()],
                program.programId
            );

            // Check if contributor PDA exists
            const contributorAccount = await program.account.contributor.fetchNullable(contributorPDA);
            if (contributorAccount) {
                console.log("Contributor already registered.");
            } else {
                console.log("Contributor not registered.");
            }
        } catch (error) {
            console.error("Error while checking if contributor exists: " + error)
        }
    }

    const checkProjectExists = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program<MvpContributoorType>(idl_object, anchProvider);

            // Define seeds for project PDA
            const [projectPDA] = await PublicKey.findProgramAddress(
                [Buffer.from("project-info"), anchProvider.publicKey.toBuffer()],
                program.programId
            );

            // Check if project PDA exists
            const projectAccount = await program.account.project.fetchNullable(projectPDA);
            if (projectAccount) {
                console.log("Project already registered.");
            } else {
                console.log("Project not registered.");
            }
        } catch (error) {
            console.error("Error while checking if project exists: " + error)
        }
    }

    // const depositBank = async (publicKey) => {
    //     try {
    //         const anchProvider = getProvider()
    //         const program = new Program<Bank>(idl_object, anchProvider)

    //         await program.methods.deposit(new BN(0.1 * web3.LAMPORTS_PER_SOL))
    //             .accounts({
    //                 bank: publicKey,
    //                 user: anchProvider.publicKey
    //             }).rpc()

    //         console.log(" Deposit done: " + publicKey)

    //     } catch (error) {
    //         console.error("Error while depositing to a bank: " + error)
    //     }
    // }

    const fetchOpenTasks = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program<MvpContributoorType>(idl_object, anchProvider);

            // Fetch all tasks and filter by status
            const tasks = await program.account.task.all();
            const openTasks = tasks.filter(task => task.account.status === 'Open');
            setOpenTasks(openTasks);
        } catch (error) {
            console.error("Error fetching open tasks: " + error);
        }
    };

    const claimTask = async (taskPublicKey: PublicKey) => {
        try {
            // Implement the logic to claim a task here
            alert(`Claiming task with public key: ${taskPublicKey.toString()}`);
            // Example: Call a program method to claim the task
            // const anchProvider = getProvider();
            // const program = new Program<MvpContributoorType>(idl_object, anchProvider);
            // await program.methods.claimTask().accounts({ task: taskPublicKey, user: anchProvider.publicKey }).rpc();
        } catch (error) {
            console.error("Error claiming task: " + error);
        }
    };

    useEffect(() => {
        fetchOpenTasks();
    }, []);

    return (
        <div>
            {openTasks.map((task) => (
                <div key={task.publicKey.toString()} className='md:hero-content flex flex-col'>
                    <h1>{task.account.name}</h1>
                    <span>{task.account.description}</span>
                    <span>Duration: {task.account.duration}</span>
                    <button
                        className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                        onClick={() => claimTask(task.publicKey)}>
                        <span>Claim Task</span>
                    </button>
                </div>
            ))}
        </div>
    );
};