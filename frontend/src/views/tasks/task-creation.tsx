import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Grid, Select, MenuItem, InputLabel } from '@mui/material';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from '../../components/mvp_contributoor.json';
import { PublicKey } from '@solana/web3.js';
import { checkProjectAccount, getProjectAccount } from '../../utils/projectUtils';
import { notify } from '../../utils/notifications';
import { useRouter } from 'next/router';
import { walletConnectedCheck } from '../../utils/utils';
import { CreateTask } from '../../components/CreateTask';

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programID = new PublicKey(idl.address);

const durationDaysToSeconds = (duration: number) => {
    return duration * 24 * 60 * 60;
}

export const CreateTaskView: React.FC = () => {
    const wallet = useWallet();
    const { connection } = useConnection();
    const router = useRouter();
    const [projectAccount, setProjectAccount] = useState<any>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const checkAccount = async () => {
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
          } else {
            router.push('/');
            return;
        }
        };
        checkAccount();
    }, [wallet.publicKey, connection]);

    return (
        <Box sx={{
            maxWidth: 600,
            margin: 'auto',
            padding: 4,
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'gray', // Default border color for all inputs
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'indigo', // Hover border color
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'indigo', // Focused border color
            },
            '& .MuiInputBase-input::placeholder': {
                color: 'gray', // Default placeholder color
                opacity: 1,
            },
            '& .MuiInputLabel-root': {
                color: 'gray', // Default label color
            },
            '& .Mui-focused .MuiInputLabel-root': {
                color: 'indigo', // Focused label color
            },
            '& .MuiInputBase-input': {
                color: 'lightgray', // Input text color
            },
        }}>
            <Paper elevation={3} sx={{ p: 4, backgroundColor: 'transparent', boxShadow: 'none' }}>
                    <Typography variant="h4" gutterBottom align="center" className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                    Create a New Task
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Task Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                multiline
                                rows={4}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <InputLabel id="duration-select-label">Duration (days)</InputLabel>
                            <Select
                                fullWidth
                                labelId="duration-select-label"
                                id="duration-select"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                variant="outlined"
                            >
                                <MenuItem value={durationDaysToSeconds(7)}>7</MenuItem>
                                <MenuItem value={durationDaysToSeconds(14)}>14</MenuItem>
                                <MenuItem value={durationDaysToSeconds(21)}>21</MenuItem>
                                <MenuItem value={durationDaysToSeconds(30)}>30</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={12}>
                            <CreateTask 
                                name={name} 
                                description={description} 
                                duration={duration} 
                            />
                        </Grid>
                    </Grid>
                </Paper>
        </Box>
    );
};