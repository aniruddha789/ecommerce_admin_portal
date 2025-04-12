import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface LoginForm {
  username: string;
  password: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => authService.login(data.username, data.password),
    onSuccess: (data) => {
      if (data.token) {
        login(data.token);
        navigate('/');
      }
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%', mx: 2 }}>
        <Typography variant="h5" gutterBottom>
          Login to Admin Panel
        </Typography>
        
        {loginMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Invalid credentials
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            {...register('username', { required: 'Username is required' })}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            {...register('password', { required: 'Password is required' })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};