import { Box, Button, Card, CardContent, Typography, Grid } from '@mui/material'

// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import { NavContributorButton } from '../../components/NavContributor';
import { NavProjectButton } from '../../components/NavProject';
import pkg from '../../../package.json';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

export const ProjectDashboardView: FC = () => {
    const wallet = useWallet();
    const { connection } = useConnection();
  
    const balance = useUserSOLBalanceStore((s) => s.balance);
    const { getUserSOLBalance } = useUserSOLBalanceStore();
  
    useEffect(() => {
      if (wallet.publicKey) {
        console.log(wallet.publicKey.toBase58());
        getUserSOLBalance(wallet.publicKey, connection);
      }
    }, [wallet.publicKey, connection, getUserSOLBalance]);

    const handleMarkComplete = async (taskId: string) => {
        alert(taskId);
        // if (publicKey) {
        //   await markTaskComplete(publicKey, taskId)
        //   setTasks(tasks.map(task => 
        //     task.id === taskId ? { ...task, completed: true } : task
        //   ))
        // }
      }
// Mock data for tasks
const tasks = [
    {
        id: '1',
        title: 'Design Homepage',
        dueDate: '2023-11-01',
        description: 'Create a responsive design for the homepage.',
        completed: false,
    },
    {
        id: '2',
        title: 'Implement Authentication',
        dueDate: '2023-11-05',
        description: 'Set up user authentication using OAuth.',
        completed: false,
    },
    {
        id: '3',
        title: 'Write Unit Tests',
        dueDate: '2023-11-10',
        description: 'Write unit tests for the new features.',
        completed: true,
    },
];

return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Project Task Dashboard
      </Typography>
      <Grid container spacing={4}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {task.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Due: {task.dueDate}
                </Typography>
                <Typography variant="body2" paragraph>
                  {task.description}
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => handleMarkComplete(task.id)}
                  disabled={task.completed}
                >
                  {task.completed ? "Completed" : "Mark as Complete"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

