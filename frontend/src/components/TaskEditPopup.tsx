// React
import React from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';

// Utils
import { secondsToDays } from '../utils/taskUtils';

interface TaskEditPopupProps {
  task: {
    id: string;
    title: string;
    description: string;
    duration: number;
  };
  onClose: () => void;
  onSave: (taskId: string, name: string, description: string) => void;
  onSaveDuration: (taskId: string, duration: number) => void;
}

export const TaskEditPopup: React.FC<TaskEditPopupProps> = ({ task, onClose, onSave, onSaveDuration }) => {
  const [name, setName] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description);
  const [duration, setDuration] = React.useState(secondsToDays(task.duration));

  const handleSave = () => {
    onSave(task.id, name, description);
  };

  const handleSaveDuration = () => {
    onSaveDuration(task.id, duration);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1300,
      }}
    >
      <Paper
        sx={{
          width: '90%',
          maxWidth: 600,
          p: 3,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Edit Task
        </Typography>
        <TextField
          fullWidth
          label="Task Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={4}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Duration (days)"
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          margin="normal"
          inputProps={{ min: 1, max: 30 }}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save Info
          </Button>
          <Button onClick={handleSaveDuration} variant="contained" color="secondary">
            Save Duration
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};