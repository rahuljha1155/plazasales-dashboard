import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow } from "@/components/ui/table";
import { GripVertical } from "lucide-react";

interface SortableSellingPointRowProps {
  id: string;
  children: React.ReactNode;
}

export function SortableSellingPointRow({ id, children }: SortableSellingPointRowProps) {
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
    <TableRow ref={setNodeRef} style={style} className="relative">
      <td className="w-10 cursor-grab active:cursor-grabbing pl-4" {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5 text-gray-400" />
      </td>
      {children}
    </TableRow>
  );
}
