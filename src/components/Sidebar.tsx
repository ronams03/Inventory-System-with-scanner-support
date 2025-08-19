import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  Package,
  Scan,
  BarChart3,
  Settings,
  LogOut,
  User,
  Bell,
  History,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Product } from '@/types/inventory';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  lowStockCount: number;
  totalProducts: number;
}

export default function Sidebar({ currentView, onViewChange, lowStockCount, totalProducts }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overview and analytics'
    },
    {
      id: 'scanner',
      label: 'Scanner',
      icon: Scan,
      description: 'Scan products'
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      description: 'Manage products',
      badge: totalProducts > 0 ? totalProducts.toString() : undefined
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: History,
      description: 'Transaction history'
    },
    {
      id: 'alerts',
      label: 'Low Stock',
      icon: AlertTriangle,
      description: 'Stock alerts',
      badge: lowStockCount > 0 ? lowStockCount.toString() : undefined,
      badgeVariant: 'destructive' as const
    }
  ];

  const handleMenuClick = (viewId: string) => {
    onViewChange(viewId);
    setIsOpen(false);
  };

  const handleLogout = () => {
    // In a real app, you would handle logout logic here
    localStorage.clear();
    window.location.reload();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Inventory</h2>
            <p className="text-sm text-muted-foreground">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? 'default' : 'ghost'}
              className="w-full justify-start h-auto p-3"
              onClick={() => handleMenuClick(item.id)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={item.badgeVariant || 'secondary'} 
                      className="ml-2 text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </nav>

      <Separator />

      {/* Settings and User */}
      <div className="p-4 space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-auto p-3">
              <Settings className="h-5 w-5 mr-3" />
              <div className="flex-1 text-left">
                <span className="font-medium">Settings</span>
                <p className="text-xs text-muted-foreground mt-1">
                  App preferences
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Package className="mr-2 h-4 w-4" />
              Inventory Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <TrendingUp className="mr-2 h-4 w-4" />
              Export Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          className="w-full justify-start h-auto p-3 text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <div className="flex-1 text-left">
            <span className="font-medium">Logout</span>
            <p className="text-xs text-muted-foreground mt-1">
              Sign out of app
            </p>
          </div>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 bg-card border-r h-screen sticky top-0">
        <SidebarContent />
      </div>
    </>
  );
}