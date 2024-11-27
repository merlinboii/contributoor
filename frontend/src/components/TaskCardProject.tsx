// React
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { AccessTime, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

// Solana
import { PublicKey } from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { TransactionSignature } from '@solana/web3.js';

// Utils
import { notify } from '../utils/notifications';
import { TaskStatus } from '../utils/enum';
import { getStatusIcon, getStatusColor, updateTaskInfo, updateTaskDuration, secondsToDays, approveTask, rejectTask } from '../utils/taskUtils';

// Components
import { TaskEditPopup } from './TaskEditPopup';

interface Task {
  pda: any;
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  status: string;
  creator: any;
  assignee: any;
  endDate: string;
  remainingTime: number;
}

interface TaskCardsProps {
  tasks: Task[];
}

const progressCalculation = (remainingTime: number, duration: number) => {
  console.log(remainingTime, duration);
  return Math.floor((remainingTime / duration) * 100);
}

export const TaskCardsProject: React.FC<TaskCardsProps> = ({ tasks }) => {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const router = useRouter();
  const ourWallet = useWallet();
  const { connection } = useConnection();

  let signature: TransactionSignature = '';

  const handleClickOpenEdit = (task: Task) => {
    setCurrentTask(task);
  };

  const handleClose = () => {
    setCurrentTask(null);
  };

  const handleSaveEditInfo = async (taskId: string, name: string, description: string) => {
    try {
      signature = await updateTaskInfo(ourWallet, ourWallet.publicKey, connection, currentTask?.pda, taskId, name, description);
      
      let latestBlockhash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

      notify({ type: 'success', message: `Task update info successfully!`, txid: signature });
      console.log("Task update info successfully.");

      router.push('/project-dashboard');
    } catch (error) {
      notify({ type: 'error', message: `Task update info failed!`});
      console.error("Error updating task info:", error);
    }
    handleClose();
  };

  const handleSaveEditDuration = async (taskId: string, duration: number) => {
    try {
      signature = await updateTaskDuration(ourWallet, ourWallet.publicKey, connection, currentTask?.pda, taskId, duration);
      
      let latestBlockhash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

      notify({ type: 'success', message: `Task update duration successfully!`, txid: signature });
      console.log("Task update duration successfully.");

      router.push('/project-dashboard');
    } catch (error) {
      notify({ type: 'error', message: `Task update duration failed!`});
      console.error("Error updating task duration:", error);
    }
    handleClose();
  };

  const handleApproveTask = async (task: Task) => {
    try {
      signature = await approveTask(ourWallet, ourWallet.publicKey, connection, task?.pda, new PublicKey(task?.assignee), task?.id);

      // Get the lates block hash to use on our transaction and confirmation
      let latestBlockhash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

      notify({ type: 'success', message: `Task approval successfully!`, txid: signature });
      console.log("Task approval successfully.");

      router.push('/project-dashboard');
    } catch (error) {
      notify({ type: 'error', message: `Task approval failed!`});
      console.error("Error approving task:", error);
    }
  }

  const handleRejectTask = async (task: Task) => {
    try {
      signature = await rejectTask(ourWallet, ourWallet.publicKey, connection, task?.pda, new PublicKey(task?.assignee), task?.id);
      
      // Get the lates block hash to use on our transaction and confirmation
      let latestBlockhash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

      notify({ type: 'success', message: `Task approval successfully!`, txid: signature });
      console.log("Task approval successfully.");

      router.push('/project-dashboard');
    } catch (error) {
      notify({ type: 'error', message: `Task approval failed!`});
      console.error("Error rejecting task:", error);
    }
  }

  return (
    <>
    <Box className='flex justify-center items-center'>
      <Grid container spacing={5} sx={{ width: '100%', justifyContent: 'center' }}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={tasks.length > 2 ? 4 : 8} md={tasks.length > 2 ? 4 : tasks.length == 1 ? 10 : 6} key={task.id}>
            <Card sx={{ 
              width: '100%',
              maxWidth: '400px',
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
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" ml={1}>
                    Duration: {secondsToDays(task.duration)} days
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
                        <progress value={progressCalculation(task.remainingTime, secondsToDays(task.duration))} max={100} />
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
                {task.status === TaskStatus.Submitted && (
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button
                      variant="contained"
                      onClick={() => handleApproveTask(task)}
                      color="success"
                      disabled={task.completed}
                      size="small"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleRejectTask(task)}
                      color="warning"
                      disabled={task.completed}
                      size="small"
                    >
                      Reject
                    </Button>
                  </Box>
                )}
                {task.status === TaskStatus.Open && (
                  <Box display="flex" justifyContent="center" mt={2}>
                    <Button
                      variant="contained"
                      onClick={() => handleClickOpenEdit(task)}
                      color="primary"
                      disabled={task.completed}
                      size="small"
                    >
                      Edit Task
                    </Button>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      {currentTask && (
        <TaskEditPopup
          task={currentTask}
          onClose={handleClose}
          onSave={handleSaveEditInfo}
          onSaveDuration={handleSaveEditDuration}
        />
        )}
      </Box>
    </>
  );
};