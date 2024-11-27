import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import idl from "../components/mvp_contributoor.json";
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { MvpContributoor } from "../components/mvp_contributoor";

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new PublicKey(idl.address);

const getProvider = (connection: any, wallet: any) => {
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    setProvider(provider);
    return provider;
};

export const checkProjectAccount = async (wallet: any, connection: any): Promise<boolean> => {
    try {
        if (!wallet.publicKey) {
            console.error("Wallet is not connected or publicKey is undefined.");
            return false;
        }

        const anchProvider = getProvider(connection, wallet)
        const program = new Program<MvpContributoor>(idl_object, anchProvider)

        const [projectPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("project-info"), wallet.publicKey.toBuffer()],
            programID
        );

        const accountInfo = await program.account.project.fetch(projectPDA);
        return accountInfo !== null;
    } catch (error) {
        console.error("Error checking project account:", error);
        return false;
    }
};

export const getProjectAccount = async (wallet: any, connection: any): Promise<any> => {
    try {
        const anchProvider = getProvider(connection, wallet)
        const program = new Program<MvpContributoor>(idl_object, anchProvider)

        const [projectPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("project-info"), wallet.publicKey.toBuffer()],
            programID
        );

        const accountInfo = await program.account.project.fetch(projectPDA);
        return accountInfo;
    } catch (error) {
        console.error("Error checking project account:", error);
        return null;
    }
};

export const getProjectAccountByPublicKey = async (wallet: any, publicKey: any, connection: any): Promise<any> => {
    try {
        const anchProvider = getProvider(connection, wallet);
        const program = new Program<MvpContributoor>(idl_object, anchProvider);

        const [projectPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("project-info"), publicKey.toBuffer()],
            programID
        );

        return projectPDA;
    } catch (error) {
        console.error("Error fetching project account:", error);
        return null;
    }
}

export const registerProject = async (wallet: any, connection: any, name: string, description: string): Promise<any> => {
    const anchProvider = getProvider(connection, wallet);
    const program = new Program<MvpContributoor>(idl_object, anchProvider);

    const projectPDA = await getProjectAccountByPublicKey(wallet, wallet.publicKey, connection);

    const registerProjectAccounts = {
        user: anchProvider.publicKey,
        project: projectPDA,
        systemProgram: SystemProgram.programId,
    };
    const signature = await program.methods.registerProject(
        name,
        description,
    ).accounts(registerProjectAccounts).rpc();

    return signature;
}