// React
import { FC } from 'react';
import { useRouter } from 'next/router';

// Solana
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { TransactionSignature } from '@solana/web3.js';

// Utils
import { notify } from "../utils/notifications";
import { createTask } from '../utils/taskUtils';

interface CreateTaskProps {
    name: string;
    description: string;
    duration: number;
}

export const CreateTask: FC<CreateTaskProps> = ({ name, description, duration }) => {
    const router = useRouter();

    const ourWallet = useWallet();
    const { connection } = useConnection();

    let signature: TransactionSignature = '';

    const onClick = async () => {
        try {
            signature = await createTask(ourWallet.publicKey, ourWallet, connection, name, description, duration);
            
            // Get the lates block hash to use on our transaction and confirmation
            let latestBlockhash = await connection.getLatestBlockhash()
            await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

            notify({ type: 'success', message: `Task created successfully!`, txid: signature });
            console.log("Task created successfully.");

            router.push('/project-dashboard');
        } catch (error) {
            notify({ type: 'error', message: `Task creation failed!`});
            console.error("Error creating task:", error);
        }
    }

    return (

        <div className="flex flex-row justify-center">
                <div className="relative group items-center">
                    <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                    rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            
                        <button
                            className="px-8 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                            onClick={onClick}
                            >
                                <span>Create Task </span>
                        </button>
                </div>
        </div>
    );
};

