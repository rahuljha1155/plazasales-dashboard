import React from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { IMember } from "@/types/ITeammember";
import { Checkbox } from "../ui/checkbox";

interface SortableRowProps {
    member: IMember;
    index: number;
    children: React.ReactNode;
    onRowClick?: (member: IMember) => void;
}

function SortableRow({ member, index, children, onRowClick }: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: member.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleRowClick = (e: React.MouseEvent) => {
        // Don't trigger row click if clicking on buttons, checkboxes, or drag handle
        const target = e.target as HTMLElement;
        if (
            target.closest('button') ||
            target.closest('[role="checkbox"]') ||
            target.closest('.cursor-grab')
        ) {
            return;
        }
        onRowClick?.(member);
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            onClick={handleRowClick}
            className={`hover:bg-zinc-50 cursor-pointer ${isDragging ? "z-50 shadow-lg" : ""}`}
        >
            <TableCell className="w-10 p-2">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded flex items-center justify-center"
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

interface SortableTableProps {
    members: IMember[];
    onDragEnd: (event: DragEndEvent) => void;
    renderRow: (member: IMember, index: number) => React.ReactNode;
    onRowClick?: (member: IMember) => void;
}

export function SortableTable({ members, onDragEnd, renderRow, onRowClick }: SortableTableProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );


    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
        >
            <div className="rounded-[2px] border bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10 bg-zinc-50 "></TableHead>
                            <TableHead className="bg-zinc-50 p-2  max-w-8"><Checkbox /></TableHead>
                            <TableHead className="bg-zinc-50 p-2 px-4 text-center">S.N.</TableHead>
                            <TableHead className="bg-zinc-50 p-2 px-4">Image</TableHead>
                            <TableHead className="bg-zinc-50 p-2 px-4">Name</TableHead>
                            <TableHead className="bg-zinc-50 p-2 px-4">Designation</TableHead>
                            <TableHead className="bg-zinc-50 p-2 px-4">Member Type</TableHead>
                            {/* <TableHead className="bg-zinc-50 p-2 px-4">Phone</TableHead> */}
                            <TableHead className="bg-zinc-50 p-2 px-4 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <SortableContext
                            items={members.map((m) => m.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {members.map((member, index) => (
                                <SortableRow
                                    key={member.id}
                                    member={member}
                                    index={index}
                                    onRowClick={onRowClick}
                                >
                                    {renderRow(member, index)}
                                </SortableRow>
                            ))}
                        </SortableContext>
                    </TableBody>
                </Table>
            </div>
        </DndContext>
    );
}
