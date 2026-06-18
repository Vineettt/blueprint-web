'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  method: 'PUT' | 'DELETE';
  isLoading?: boolean;
}

const config = {
  PUT: {
    title: 'Confirm Update',
    description: 'Are you sure you want to update this item? This action cannot be undone.',
    confirmLabel: 'Yes, Update',
    confirmVariant: 'default' as const,
  },
  DELETE: {
    title: 'Confirm Delete',
    description: 'Are you sure you want to delete this item? This action is permanent.',
    confirmLabel: 'Yes, Delete',
    confirmVariant: 'destructive' as const,
  },
};

export function ConfirmActionDialog({
  open,
  onOpenChange,
  onConfirm,
  method,
  isLoading = false,
}: ConfirmActionDialogProps) {
  const { title, description, confirmLabel, confirmVariant } = config[method];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="button" variant={confirmVariant} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
