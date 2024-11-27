// React
import React, { useState } from 'react';
import { Grid, Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { AccessTime, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

// Solana
import { PublicKey } from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { TransactionSignature } from '@solana/web3.js';

// Utils
import { notify } from '../utils/notifications';
import { claimTask, submitTask } from '../utils/taskUtils';
import { TaskStatus } from '../utils/enum';

interface Task {
  pda: any;
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  status: string;
  creator: any;
  projectName: string;
  remainingTime: number;
  endDate: string;
}

interface TaskCardsProps {
  tasks: Task[];
}

const getStatusIcon = (status: string): string => {
  switch (status) {
    case TaskStatus.Open:
      return "Open";
    case TaskStatus.Claimed:
      return "Claimed";
    case TaskStatus.Submitted:
      return "Submitted";
    case TaskStatus.Completed:
      return "Completed";
    default:
      return "Unknown";
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case TaskStatus.Open: return "default";
    case TaskStatus.Claimed: return "primary";
    case TaskStatus.Submitted: return "warning";
    case TaskStatus.Completed: return "success";
    default: return "default";
  }
}

const progressCalculation = (remainingTime: number, duration: number) => {
  return Math.floor((remainingTime / duration) * 100);
}

export const TaskCardsContributor: React.FC<TaskCardsProps> = ({ tasks }) => {
  const router = useRouter();

  const ourWallet = useWallet();
  const { connection } = useConnection();

  let signature: TransactionSignature = '';

  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  const handleMouseEnter = (taskId: string) => {
    setHoveredTaskId(taskId);
  };

  const handleMouseLeave = () => {
    setHoveredTaskId(null);
  };


  const handleClaimTask = async (task: Task) => {
    try {
      signature = await claimTask(ourWallet, new PublicKey(task?.creator), connection, task?.pda, task?.id);
      
      // Get the lates block hash to use on our transaction and confirmation
      let latestBlockhash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

      notify({ type: 'success', message: `Task claimed successfully!`, txid: signature });
      console.log("Task claimed successfully.");

      router.push('/my-tasks');
  } catch (error) {
      notify({ type: 'error', message: `Task claiming failed!`});
      console.error("Error claiming task:", error);
  } 
  };

  const handleSubmitTask = async (task: Task) => {
    try {
      signature = await submitTask(ourWallet, new PublicKey(task?.creator), connection, task?.pda, task?.id);
      
      // Get the lates block hash to use on our transaction and confirmation
      let latestBlockhash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

      notify({ type: 'success', message: `Task submission successfully!`, txid: signature });
      console.log("Task submission successfully.");

      router.push('/my-tasks');
    } catch (error) {
      notify({ type: 'error', message: `Task submission failed!`});
      console.error("Error submitting task:", error);
    }
  }

  return (
    <Box className='flex justify-center items-center'>
      <Grid container spacing={5} sx={{ width: '100%' }}>
        {tasks.map((task) => (
        <Grid 
          item 
          xs={12} 
          sm={tasks.length > 2 ? 4 : 6} 
          md={tasks.length > 2 ? 4 : tasks.length == 1 ? 10 : 6} 
          key={task.id + task.creator}
          onMouseEnter={() => handleMouseEnter(task.id)}
          onMouseLeave={handleMouseLeave}
        >
          <Card sx={{ 
            width: '100%',
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            boxShadow: 3, 
            borderRadius: 2,
            padding: 2,
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6,
              },
            }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" gutterBottom>
                {task.title}
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="body2" color="text.secondary">
                  by {task.projectName}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" ml={1}>
                  Duration: {task.duration} days
                </Typography>
              </Box>
              {task.status === TaskStatus.Claimed && (
                <>
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                  Due date: {task.endDate}
                  </Typography>
                  </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <progress value={progressCalculation(task.remainingTime, task.duration)} max={100} />
                  <Typography variant="body2" color="text.secondary" ml={1}>
                    Remain: {task.remainingTime} days
                  </Typography>
                </Box>
                </>
              )}
              <Typography variant="body1" color="text.secondary" paragraph>
                {task.description}
              </Typography>
            </CardContent>
            <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Chip 
                  icon={task.completed ? <CheckCircle /> : <RadioButtonUnchecked />}
                  label={getStatusIcon(task.status)}
                  color={getStatusColor(task.status)}
                  size="small"
                />
              </Box>
              {task.status === TaskStatus.Open && (
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (task.creator.toBase58() !== ourWallet.publicKey.toBase58()) {
                          handleClaimTask(task);
                        }
                      }}
                      color="primary"
                      disabled={task.completed || (hoveredTaskId === task.id && task.creator.toBase58() === ourWallet.publicKey.toBase58())}
                      size="small"
                    >
                      {hoveredTaskId === task.id && task.creator.toBase58() === ourWallet.publicKey.toBase58() ? 
                        "Own" : 
                        "Claim"
                      }
                    </Button>
                  </Box>
                )}
              {task.status === TaskStatus.Claimed && (
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Button
                    variant="contained"
                    onClick={() => handleSubmitTask(task)}
                    color="primary"
                    size="small"
                  >
                    Submit
                  </Button>
                </Box>
              )}
            </Box>
          </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};