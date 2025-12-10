import React from 'react';
import Drawer from '@mui/material/Drawer';
import { Box, IconButton, Typography } from '@mui/material';
import { X } from 'lucide-react';

interface RightDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  width?: number | string;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
}

export function RightDrawer({
  open,
  onClose,
  title,
  children,
  width = 400,
  anchor = 'right',
}: RightDrawerProps) {
  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {title && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
            }}
          >
            {typeof title === 'string' ? (
              <Typography variant="h6" component="h2">
                {title}
              </Typography>
            ) : (
              title
            )}
            <IconButton
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <X className="size-5" />
            </IconButton>
          </Box>
        )}
        {children}
      </Box>
    </Drawer>
  );
}

