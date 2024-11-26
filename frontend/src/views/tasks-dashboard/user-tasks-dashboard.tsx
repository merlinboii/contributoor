import { Box, Button, Card, CardContent, Typography, Grid } from '@mui/material';

// Next, React
import { FC, useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import idl from '../../components/mvp_contributoor.json';
import { MvpContributoor as MvpContributoorType } from '../../components/mvp_contributoor';
import { notify } from '../../utils/notifications';
import { checkContributorAccount, getContributorAccount } from 'utils/contributorUtils';
import { useRouter } from 'next/router';
import { TaskCardsContributor } from '../../components/TaskCardContributor';
import { TaskStatus } from 'utils/enum';

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new PublicKey(idl.address);

const durationSecondsToDays = (duration: number) => {
    return Math.round(duration / (24 * 60 * 60));
}


export const UserTasksDashboardView: FC = () => {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [tasks, setTasks] = useState<any[]>([]);
    const router = useRouter();
    const [contributorAccount, setContributorAccount] = useState<any>(null);

    const getProvider = () => {
        const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
        setProvider(provider);
        return provider;
    };

    useEffect(() => {
        const fetchAllTasks = async () => {
            if (wallet.publicKey) {
                const hasProjectAccount = await checkContributorAccount(wallet, connection);
                if (!hasProjectAccount) {
                  router.push('/'); // Redirect to the main page if no account is found
                  return;
                }
                const contributorAccount = await getContributorAccount(wallet, connection);
                setContributorAccount(contributorAccount);
              } else {
                notify({
                  type: 'error',
                  message: 'Please connect your wallet to continue',
                });
                router.push('/');
                return;
            }

            try {
                const anchProvider = getProvider();
                const program = new Program<MvpContributoorType>(idl_object, anchProvider);

                // Fetch all task accounts
                const taskAccounts = await program.account.task.all();
                
                const tasks = taskAccounts
                .filter((task) => task.account.assignee?.toBase58() === anchProvider.publicKey.toBase58())
                .map((task) => ({
                    pda: task.publicKey,
                    id: task.account.uuid.toString(),
                    title: task.account.name,
                    description: task.account.description,
                    duration: durationSecondsToDays(task.account.duration),
                    status: Object.keys(task.account.status)[0],
                    creator: task.account.creator,
                }));

                setTasks(tasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                notify({ type: 'error', message: 'Failed to fetch tasks' });
            }
        };

        fetchAllTasks();
    }, [connection]);

    const handleMarkComplete = async (taskId: string) => {
        alert(taskId);
        // Implement task completion logic here
    };

    return (
        <Box sx={{ maxWidth: 1400, margin: 'auto', padding: 4, position: 'relative' }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                    {contributorAccount?.name}&apos;s Tasks
                </h1>
            </Box>
            {tasks.length === 0 ? (
                <Box textAlign="center" mt={4}>
                    <Typography variant="h6" gutterBottom>
                        oOh seems your tasks are empty!, Let&apos;s claim some!
                    </Typography>
                </Box>
            ) : (
                <TaskCardsContributor tasks={tasks} handleMarkComplete={handleMarkComplete} />
            )}
        </Box>
    );
};