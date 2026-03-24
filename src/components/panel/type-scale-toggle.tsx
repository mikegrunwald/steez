'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useTokens } from '@/lib/state/token-context';

const HEADING_KEYS = [
  '--font-size-h1',
  '--font-size-h2',
  '--font-size-h3',
  '--font-size-h4',
  '--font-size-h5',
  '--font-size-h6',
];

export function TypeScaleToggle() {
  const { typeScaleUnlocked, dispatch } = useTokens();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
      dispatch({ type: 'SET_TYPE_SCALE_UNLOCKED', unlocked: true });
    } else {
      setConfirmOpen(true);
    }
  };

  const handleConfirmLock = () => {
    dispatch({ type: 'SET_TYPE_SCALE_UNLOCKED', unlocked: false });
    for (const key of HEADING_KEYS) {
      dispatch({ type: 'RESET_TOKEN', key });
    }
    setConfirmOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 py-2">
        <Switch
          checked={typeScaleUnlocked}
          onCheckedChange={handleCheckedChange}
          id="type-scale-toggle"
        />
        <label
          htmlFor="type-scale-toggle"
          className="text-sm cursor-pointer select-none"
        >
          Individual heading sizes
        </label>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset individual heading sizes?</AlertDialogTitle>
            <AlertDialogDescription>
              Turning off individual heading sizes will recalculate h1–h6 values
              from the type ratio. Any custom overrides will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLock}>
              Reset and lock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
