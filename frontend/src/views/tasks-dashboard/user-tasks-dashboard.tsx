import { Box, Button, Card, CardContent, Typography, Grid, ButtonGroup } from '@mui/material';

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
import { Cancel, Task, CheckCircle } from '@mui/icons-material';
import { getProjectAccountByPublicKey } from 'utils/projectUtils';
import { getTaskAssignmentAccountByPublicKey } from 'utils/taskUtils';

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new PublicKey(idl.address);

const durationSecondsToDays = (duration: number) => {
    return Math.round(duration / (24 * 60 * 60));
}

const statusOrder = {
    [TaskStatus.Open]: 1,
    [TaskStatus.Submitted]: 2,
    [TaskStatus.Claimed]: 3,
    [TaskStatus.Completed]: 4,
};

export const UserTasksDashboardView: FC = () => {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [tasks, setTasks] = useState<any[]>([]);
    const router = useRouter();
    const [contributorAccount, setContributorAccount] = useState<any>(null);
    const [claimedTasks, setClaimedTasks] = useState<number>(0);
    const [failedTasks, setFailedTasks] = useState<number>(0);
    const [successTasks, setSuccessTasks] = useState<number>(0);

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

                setClaimedTasks(contributorAccount.tasksProcess ? Number(contributorAccount.tasksProcess) : 0);
                setFailedTasks(contributorAccount.tasksFailed ? Number(contributorAccount.tasksFailed) : 0);
                setSuccessTasks(contributorAccount.tasksCompleted ? Number(contributorAccount.tasksCompleted) : 0);
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

                // Fetch all task accounts for the contributor
                const memcmpFilter = { 
                    memcmp: {
                        offset: 8 + 32 + 1,
                        bytes: anchProvider.publicKey.toBase58()
                    }
                }

                const taskAccounts = await program.account.task.all([
                    memcmpFilter
                ]);
                
                const tasks = await Promise.all(taskAccounts
                    .sort((a, b) => {
                        const statusA = Object.keys(a.account.status)[0];
                        const statusB = Object.keys(b.account.status)[0];
                        return statusOrder[statusA] - statusOrder[statusB];
                    })                    
                    .map(async (task) => {
                        const projectPDA = await getProjectAccountByPublicKey(wallet, task.account.creator, connection);
                        const project = await program.account.project.fetch(projectPDA);
                        
                        const taskAssignmentPDA = await getTaskAssignmentAccountByPublicKey(task.publicKey, wallet.publicKey);
                        const taskAssignment = await program.account.taskAssignment.fetch(taskAssignmentPDA);
                        const now = Math.floor(new Date().getTime() / 1000);
                        const endTime = taskAssignment.endTime.toNumber() < now ? 0 : taskAssignment.endTime.toNumber() - now;

                        return {
                            pda: task.publicKey,
                            id: task.account.uuid.toString(),
                            title: task.account.name,
                            description: task.account.description,
                            duration: durationSecondsToDays(task.account.duration),
                            status: Object.keys(task.account.status)[0],
                            creator: task.account.creator,
                            projectName: project.name,
                            remainingTime: durationSecondsToDays(endTime),
                            endDate: new Date(taskAssignment.endTime.toNumber() * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                        }
                    })
                );
            
                setTasks(tasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                notify({ type: 'error', message: 'Failed to fetch tasks' });
            }
        };

        fetchAllTasks();
    }, [connection]);

    return (
        <Box sx={{ maxWidth: 1400, margin: 'auto', padding: 4, position: 'relative' }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                    {contributorAccount?.name}&apos;s Tasks
                </h1>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
            <ButtonGroup color="secondary" variant="outlined" aria-label="Basic button group">
                <Button color="primary" startIcon={<Task />}>Processing: {claimedTasks}</Button>
                <Button color="success" startIcon={<CheckCircle />}>Success: {successTasks}</Button>
                <Button color="warning" startIcon={<Cancel />}>Failed: {failedTasks}</Button>
            </ButtonGroup>
            </Box>
            {tasks.length === 0 ? (
                <Box textAlign="center" mt={4}>
                    <Typography variant="h6" gutterBottom>
                        oOh seems your tasks are empty!, Let&apos;s claim some!
                    </Typography>
                </Box>
            ) : (
                <TaskCardsContributor tasks={tasks} />
            )}
        </Box>
    );
};