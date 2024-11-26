import { verify } from '@noble/ed25519';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { FC, useCallback, useState, useEffect } from 'react';
import { notify } from "../utils/notifications";
import { useRouter } from 'next/router';

import { Program, AnchorProvider, web3, utils, BN, setProvider } from "@coral-xyz/anchor"
import idl from "./mvp_contributoor.json"
import { MvpContributoor as MvpContributoorType } from "./mvp_contributoor"
import { PublicKey, SystemProgram, TransactionSignature } from '@solana/web3.js';

const idl_string = JSON.stringify(idl)
const idl_object = JSON.parse(idl_string)
const programID = new PublicKey(idl.address)

interface RegisterContributorProps {
    name: string;
}

export const RegisterContributor: FC<RegisterContributorProps> = ({ name }) => {
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

            const [contributorPDA] = await PublicKey.findProgramAddress(
                [Buffer.from("contributor-info"), anchProvider.publicKey.toBuffer()],
                program.programId
            );

            const [nameRegistryPDA] = await PublicKey.findProgramAddress(
                [Buffer.from("contributor-name"), Buffer.from(name)],
                program.programId
            );

            // define an obj before using
            const registerContributorAccounts = {
                user: anchProvider.publicKey,
                contributor: contributorPDA,
                nameRegistry: nameRegistryPDA,
                systemProgram: SystemProgram.programId,
            };
            const signature = await program.methods.registerContributor(
                name
            ).accounts(registerContributorAccounts).rpc();

            // Get the latest block hash to use on our transaction and confirmation
            const latestBlockhash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

            notify({ type: 'success', message: `Contributor registered successfully!`, txid: signature });
            console.log("Contributor registered successfully.");

            router.push('/tasks-dashboard');
        } catch (error) {
            notify({ type: 'error', message: `Contributor registration failed!` });
            console.error("Error registering contributor:", error);
        }
    };

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
