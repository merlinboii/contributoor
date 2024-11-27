// Next, React
import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Typography, IconButton } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddIcon from '@mui/icons-material/Add';

// Solana
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import idl from '../../components/mvp_contributoor.json';
import { MvpContributoor as MvpContributoorType } from '../../components/mvp_contributoor';
import { notify } from '../../utils/notifications';

// Utils
import { checkProjectAccount, getProjectAccount } from '../../utils/projectUtils';
import { walletConnectedCheck } from '../../utils/utils';
import { TaskStatus } from '../../utils/enum';

// Components   
import { TaskCardsProject } from '../../components/TaskCardProject';
import { getTaskAssignmentAccountByPublicKey } from 'utils/taskUtils';

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new PublicKey(idl.address);

const durationSecondsToDays = (duration: number) => {
    return Math.round(duration / (24 * 60 * 60));
}

const filterTasks = (tasks: any[], owner: PublicKey) => {
    return tasks.filter((task) => {
        return task.account.creator.toBase58() === owner.toBase58();
    });
}

const statusOrder = {
    [TaskStatus.Open]: 1,
    [TaskStatus.Submitted]: 2,
    [TaskStatus.Claimed]: 3,
    [TaskStatus.Completed]: 4,
};

export const ProjectDashboardView: FC = () => {
    const router = useRouter();
    const wallet = useWallet();
    const { connection } = useConnection();
    const [tasks, setTasks] = useState<any[]>([]);
    const [projectAccount, setProjectAccount] = useState<any>(null);
    const getProvider = () => {
        const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
        setProvider(provider);
        return provider;
    };

    useEffect(() => {
        const setMode = () => {
            localStorage.setItem('mode', 'Project');
        }

        const fetchTasks = async () => {
            const walletConnected = await walletConnectedCheck(wallet);
            if (walletConnected) {
                const hasProjectAccount = await checkProjectAccount(wallet, connection);
                if (!hasProjectAccount) {
                    notify({
                        type: 'error',
                        message: 'Please register your project first',
                    });
                  router.push('/'); // Redirect to the main page if no account is found
                  return;
                }
                const projectAccount = await getProjectAccount(wallet, connection);
                setProjectAccount(projectAccount);
              } else {
                router.push('/');
                return;
            }

            try {
                const anchProvider = getProvider();
                const program = new Program<MvpContributoorType>(idl_object, anchProvider);
                
                const memcmpFilter = { 
                    memcmp: {
                        offset: 8,
                        bytes: anchProvider.publicKey.toBase58()
                    }
                }

                const taskAccounts = await program.account.task.all([
                    memcmpFilter
                ]);

                console.log(taskAccounts);

                const tasks = await Promise.all(taskAccounts  
                .sort((a, b) => {
                    const statusA = Object.keys(a.account.status)[0];
                    const statusB = Object.keys(b.account.status)[0];
                    return statusOrder[statusA] - statusOrder[statusB];
                })                  
                .map(async (task) => {
                    const status = Object.keys(task.account.status)[0];
                    
                    let endTime: number = 0;
                    let taskAssignment: any;
                    if (task.account.assignee) {
                        const taskAssignmentPDA = await getTaskAssignmentAccountByPublicKey(task.publicKey, new PublicKey(task.account.assignee));
                        taskAssignment = await program.account.taskAssignment.fetch(taskAssignmentPDA);
                        const now = Math.floor(new Date().getTime() / 1000);
                        endTime = taskAssignment.endTime.toNumber() < now ? 0 : taskAssignment.endTime.toNumber() - now;
                    }
                    
                    return {
                        pda: task.publicKey,
                        id: task.account.uuid.toString(),
                        title: task.account.name,
                        description: task.account.description,
                        duration: task.account.duration,
                        completed: status === TaskStatus.Completed,
                        status: status,
                        creator: task.account.creator?.toBase58(),
                        assignee: task.account.assignee?.toBase58(),
                        remainingTime: durationSecondsToDays(endTime),
                        endDate: endTime == 0 ? 'N/A' : new Date(taskAssignment.endTime.toNumber() * 1000).toLocaleDateString(),
                    };
                })
                );

                setTasks(tasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                notify({ type: 'error', message: 'Failed to fetch tasks' });
            }
        };
        
        setMode();
        fetchTasks();
    }, [wallet.publicKey, connection]);

    const handleCreateTask = () => {
        router.push('/create-task');
    };

    return (
        <Box sx={{ maxWidth: 1400, margin: 'auto', padding: 4, position: 'relative' }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                    {projectAccount?.name} Dashboard
                </h1>
                {tasks.length > 0 && (
                    <IconButton aria-label="add" onClick={handleCreateTask}>
                        <AddCircleIcon sx={{ color: 'white', fontSize: 40 }} />
                    </IconButton>
                )}
            </Box>
            {tasks.length === 0 ? (
                <Box textAlign="center" mt={4}>
                    <Typography variant="h6" gutterBottom>
                        oOh seems like the project doesn&apos;t have any tasks yet.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon sx={{ color: 'white', fontSize: 20 }} />}
                        sx={{
                            backgroundColor: '#9945FF',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#7e3bdc',
                            },
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontWeight: 'normal',
                        }}
                        onClick={handleCreateTask}
                    >
                        Create your first task
                    </Button>
                </Box>
            ) : (
                <TaskCardsProject tasks={tasks} />
            )}
        </Box>
    );
};