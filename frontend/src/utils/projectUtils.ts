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

export const checkProjectAccount = async (publicKey: PublicKey, connection: any): Promise<boolean> => {
    try {
        const [projectPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("project-info"), publicKey.toBuffer()],
            programID
        );

        const accountInfo = await connection.getAccountInfo(projectPDA);
        return accountInfo !== null;
    } catch (error) {
        console.error("Error checking project account:", error);
        return false;
    }
};