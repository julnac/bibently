import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import React from "react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center flex-wrap gap-1 text-sm text-gray-500">
                {/* Home Icon */}
                <li className="flex items-center">
                    <Link
                        href="/"
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-primary"
                        aria-label="Strona główna"
                    >
                        <Home size={16} />
                    </Link>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex items-center">
                            <ChevronRight size={14} className="mx-1 text-gray-400 shrink-0" />
                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className="hover:text-primary hover:underline transition-colors truncate max-w-[150px] sm:max-w-none"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={`truncate max-w-[200px] sm:max-w-xs ${isLast ? "font-semibold text-gray-900" : ""
                                        }`}
                                    aria-current={isLast ? "page" : undefined}
                                >
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
