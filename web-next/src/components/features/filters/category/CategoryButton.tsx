interface CategoryButtonProps {
    name: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}

/**
 * Dumb presentational component — ready for NativeWind/shared.
 */
export default function CategoryButton({ name, icon, isActive, onClick }: CategoryButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
        flex flex-col items-center gap-1 px-2 py-2 min-w-[64px] shrink-0
        border-b-2 transition-all duration-200 cursor-pointer
        ${isActive
                    ? 'border-foreground text-text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }
      `}
        >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-xs font-medium whitespace-nowrap">{name}</span>
        </button>
    );
}