import { notify } from "./notifications";

export const walletConnectedCheck = async (wallet: any): Promise<boolean> => {
    if (!wallet.publicKey) {
        notify({
            type: 'error',
            message: 'Please connect your wallet to continue',
        });
        return false;
    } else {
        return true;
    }
}