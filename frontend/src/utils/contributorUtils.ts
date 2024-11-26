import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import idl from "../components/mvp_contributoor.json";
import { PublicKey } from '@solana/web3.js';
import { MvpContributoor } from "../components/mvp_contributoor";

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new PublicKey(idl.address);

const getProvider = (connection: any, wallet: any) => {
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    setProvider(provider);
    return provider;
};

export const checkContributorAccount = async (wallet: any, connection: any): Promise<boolean> => {
    try {
        if (!wallet.publicKey) {
            console.error("Wallet is not connected or publicKey is undefined.");
            return false;
        }

        const anchProvider = getProvider(connection, wallet);
        const program = new Program<MvpContributoor>(idl_object, anchProvider);

        const [contributorPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("contributor-info"), anchProvider.publicKey.toBuffer()],
            programID
        );

        const accountInfo = await program.account.contributor.fetch(contributorPDA);
        return accountInfo !== null;
    } catch (error) {
        console.error("Error checking contributor account:", error);
        return false;
    }
};

export const getContributorAccount = async (wallet: any, connection: any): Promise<any> => {
    try {
        const anchProvider = getProvider(connection, wallet);
        const program = new Program<MvpContributoor>(idl_object, anchProvider);

        const [contributorPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("contributor-info"), anchProvider.publicKey.toBuffer()],
            programID
        );

        const accountInfo = await program.account.contributor.fetch(contributorPDA);
        return accountInfo;
    } catch (error) {
        console.error("Error fetching contributor account:", error);
        return null;
    }
};

export const getContributorAccountByPublicKey = async (wallet: any, publicKey: any, connection: any): Promise<any> => {
    try {

        const anchProvider = getProvider(connection, wallet);
        const program = new Program<MvpContributoor>(idl_object, anchProvider);

        const [contributorPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("contributor-info"), publicKey.toBuffer()],
            programID
        );

        return contributorPDA;
    } catch (error) {
        console.error("Error fetching contributor account:", error);
        return null;
    }
}