import { LucideIcon } from 'lucide-react';

interface CategoryButtonProps {
    name: string;
    isActive: boolean;
    onClick: () => void;
    icon?: LucideIcon;
}

export default function CategoryButton({ name, isActive, onClick, icon: Icon }: CategoryButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
                px-4 py-2.5 rounded-md border border-border text-xs font-mono uppercase flex items-center gap-2 transition-all duration-200 cursor-pointer whitespace-nowrap
                ${isActive
                    ? 'bg-foreground text-white'
                    : 'bg-surface text-text-primary hover:bg-primary-light'
                }
            `}
        >
            {Icon && <Icon size={16} />}
            {name}
        </button>
    );
}