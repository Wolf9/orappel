import * as React from "react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Supprimer",
  cancelText = "Annuler"
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onCancel}
      />
      <div className="relative bg-card text-card-foreground border border-border shadow-lg rounded-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} className="w-full sm:w-auto">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
