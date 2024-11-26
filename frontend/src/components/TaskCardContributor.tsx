import React, { useState } from 'react';
import { Grid, Card, CardContent, Typography, Button, Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { AccessTime, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { TaskStatus } from '../utils/enum';
import { get } from 'http';

import { Program, AnchorProvider, web3, utils, BN, setProvider } from "@coral-xyz/anchor"
import idl from "./mvp_contributoor.json"
import { MvpContributoor as MvpContributoorType } from "./mvp_contributoor"
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useRouter } from 'next/router';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { TransactionSignature } from '@solana/web3.js';
import { notify } from '../utils/notifications';

import { claimTask, submitTask } from '../utils/taskUtils';

interface Task {
  pda: any;
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  status: string;
  creator: any;
}

interface TaskCardsProps {
  tasks: Task[];
  handleMarkComplete: (id: string) => void;
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

export const TaskCardsContributor: React.FC<TaskCardsProps> = ({ tasks, handleMarkComplete }) => {
  const [openEditInfo, setOpenEditInfo] = useState(false);
  const [openEditDuration, setOpenEditDuration] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(0);

  const router = useRouter();

  const ourWallet = useWallet();
  const { connection } = useConnection();

  let signature: TransactionSignature = '';

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
    <Grid container spacing={20}>
      {tasks.map((task) => (
        <Grid item xs={12} sm={6} md={4} key={task.id}>
          <Card sx={{ 
            width: '300px',
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
                  Duration: {task.duration} days
                </Typography>
              </Box>
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
                  onClick={() => handleClaimTask(task)}
                  color="primary"
                  disabled={task.completed}
                  size="small"
                >
                  Claim
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
  );
};