
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import DeliverableControl from "./DeliverableControl";

interface DeliverableControlModalProps {
  onProcessClick?: (processId: string) => void;
  onScheduleClick?: () => void;
}

const DeliverableControlModal = ({ onProcessClick, onScheduleClick }: DeliverableControlModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleProcessClick = (processId: string) => {
    onProcessClick?.(processId);
    setIsOpen(false); // Fecha o modal ao navegar para processo
  };

  const handleScheduleClick = () => {
    onScheduleClick?.();
    setIsOpen(false); // Fecha o modal ao navegar para cronograma
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <ClipboardList className="w-5 h-5 mr-2" />
          Controle de Entregas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            Controle de Entregas
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <DeliverableControl 
            onProcessClick={handleProcessClick}
            onScheduleClick={handleScheduleClick}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliverableControlModal;
