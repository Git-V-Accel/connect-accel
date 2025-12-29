/**
 * HoldCancelModal Component
 * Modal for holding or cancelling a project with mandatory remark
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RichTextEditor } from '../common/RichTextEditor';
import { AlertCircle } from 'lucide-react';

interface HoldCancelModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (remark: string) => Promise<void>;
  action: 'hold' | 'cancel';
  projectTitle?: string;
  loading?: boolean;
}

export default function HoldCancelModal({
  open,
  onClose,
  onConfirm,
  action,
  projectTitle,
  loading = false,
}: HoldCancelModalProps) {
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');

  // Helper function to strip HTML and get plain text for validation
  const getPlainText = (html: string): string => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleSubmit = async () => {
    const plainText = getPlainText(remark);
    if (!plainText.trim()) {
      setError('Please provide a reason');
      return;
    }

    setError('');
    try {
      // Send plain text to backend (backend will also handle HTML if sent)
      await onConfirm(plainText.trim());
      setRemark('');
    } catch (err) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRemark('');
      setError('');
      onClose();
    }
  };

  const actionLabel = action === 'hold' ? 'Hold' : 'Cancel';
  const actionDescription =
    action === 'hold'
      ? 'Put this project on hold temporarily. You can resume it later.'
      : 'Cancel this project permanently. This action cannot be undone.';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>{actionLabel} Project</DialogTitle>
          <DialogDescription>
            {actionDescription}
            {projectTitle && (
              <span className="block mt-2 font-medium text-gray-900">
                Project: {projectTitle}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="remark">
              Reason <span className="text-red-500">*</span>
            </Label>
            <RichTextEditor
              value={remark}
              onChange={(value) => {
                setRemark(value);
                if (error) setError('');
              }}
              placeholder={`Please provide a reason for ${actionLabel.toLowerCase()}ing this project...`}
              minHeight="120px"
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="size-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !getPlainText(remark).trim()}
            variant={action === 'cancel' ? 'destructive' : 'default'}
          >
            {loading ? 'Processing...' : `Confirm ${actionLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

