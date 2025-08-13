import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertTriangle, Shield, Target, CheckCircle, TrendingUp, Calendar, Database, Menu } from 'lucide-react';

interface MobileTabSelectorProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileTabSelector = ({ activeTab, setActiveTab }: MobileTabSelectorProps) => {
  const hiddenTabs = [
    { value: 'dados', label: 'Dados', icon: Database },
    { value: 'risks', label: 'Riscos', icon: AlertTriangle },
    { value: 'kris', label: 'KRIs', icon: TrendingUp },
    { value: 'controls', label: 'Controles', icon: Shield },
    { value: 'improvements', label: 'Melhorias', icon: Target },
    { value: 'testing', label: 'Testes', icon: CheckCircle },
    { value: 'schedule', label: 'Cronograma', icon: Calendar },
  ];

  const getActiveTabName = () => {
    const tab = hiddenTabs.find(t => t.value === activeTab);
    return tab ? tab.label : 'Mais';
  };

  return (
    <div className="mt-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Menu className="w-4 h-4" />
            {getActiveTabName()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          {hiddenTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <DropdownMenuItem 
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={activeTab === tab.value ? 'bg-accent' : ''}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {tab.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileTabSelector;