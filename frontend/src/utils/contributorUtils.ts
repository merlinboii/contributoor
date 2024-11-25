import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import idl from "../components/mvp_contributoor.json";
import { PublicKey } from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new PublicKey(idl.address);

const getProvider = (connection: any, wallet: any) => {
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    setProvider(provider);
    return provider;
};

export const checkContributorAccount = async (publicKey: PublicKey, connection: any): Promise<boolean> => {
    try {
        const [contributorPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("contributor-info"), publicKey.toBuffer()],
            programID
        );

        const accountInfo = await connection.getAccountInfo(contributorPDA);
        return accountInfo !== null;
    } catch (error) {
        console.error("Error checking contributor account:", error);
        return false;
    }
};