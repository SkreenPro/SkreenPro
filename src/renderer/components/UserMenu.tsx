import { useState, useRef, useEffect } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

interface UserMenuProps {
  userEmail: string;
  onSignOut: () => void;
}

const UserMenu = ({ userEmail, onSignOut }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="xs"
        variant="outline"
        className="gap-2"
      >
        <User size={16} />
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#262624] border border-border rounded-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium text-foreground truncate">{userEmail}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              onSignOut();
            }}
            className="w-full px-4 py-2 hover:bg-[#202020] text-left text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
