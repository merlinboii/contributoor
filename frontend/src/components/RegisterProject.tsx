import { verify } from '@noble/ed25519';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { FC, useCallback, useState, useEffect } from 'react';
import { notify } from "../utils/notifications";
import { useRouter } from 'next/router';

import { Program, AnchorProvider, web3, utils, BN, setProvider } from "@coral-xyz/anchor"
import idl from "./mvp_contributoor.json"
import { MvpContributoor as MvpContributoorType } from "./mvp_contributoor"
import { PublicKey, SystemProgram } from '@solana/web3.js';

const idl_string = JSON.stringify(idl)
const idl_object = JSON.parse(idl_string)
const programID = new PublicKey(idl.address)

interface RegisterProjectProps {
    name: string;
    description: string;
}

export const RegisterProject: FC<RegisterProjectProps> = ({ name, description }) => {
    const router = useRouter();

    const ourWallet = useWallet();
    const { connection } = useConnection();

    let signature: TransactionSignature = '';

    const getProvider = () => {
        const provider = new AnchorProvider(connection, ourWallet, AnchorProvider.defaultOptions())
        setProvider(provider)
        return provider
    }

    const onClick = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program<MvpContributoorType>(idl_object, anchProvider);
        
            const [projectPDA] = await PublicKey.findProgramAddress(
                [Buffer.from("project-info"), anchProvider.publicKey.toBuffer()],
                program.programId
            );
            
            signature = await program.methods.registerProject(
                name,
                description,
            ).accounts({
                user: anchProvider.publicKey,
                project: projectPDA,
                systemProgram: SystemProgram.programId,
            }).rpc();
            
            // Get the lates block hash to use on our transaction and confirmation
            let latestBlockhash = await connection.getLatestBlockhash()
            await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

            notify({ type: 'success', message: `Project registered successfully!`, txid: signature });
            console.log("Project registered successfully.");

            router.push('/project-dashboard');
        } catch (error) {
            notify({ type: 'error', message: `Project registration failed!`});
            console.error("Error registering project:", error);
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
                                <span>Register </span>
                        </button>
                </div>
        </div>

        
    );
};

