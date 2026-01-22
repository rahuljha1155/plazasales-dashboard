import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow, TableCell } from "@/components/ui/table";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { Member } from "@/types/team-member";

interface DraggableRowProps {
    id: string;
    company: Member;
    children: React.ReactNode;
}

export function DraggableRow({ id, company, children }: DraggableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={`hover:bg-zinc-50 ${isDragging ? "z-50" : ""}`}
        >
            <TableCell className="w-10 p-2">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                >
                    <Icon
                        icon="material-symbols:drag-indicator"
                        width="20"
                        height="20"
                        className="text-gray-400"
                    />
                </div>
            </TableCell>
            {children}
        </TableRow>
    );
}
