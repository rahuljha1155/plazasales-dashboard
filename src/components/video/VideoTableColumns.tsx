import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { Video } from "@/hooks/useVideo";
import { CaretSortIcon } from "@radix-ui/react-icons";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Video as VideoIcon, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoTableColumnsProps {
    onView: (video: Video) => void;
    onEdit: (video: Video) => void;
    onDelete: (id: string) => void;
}

const extractYouTubeId = (url: string) => {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
        return url;
    }
    return null;
};

const getThumbnailUrl = (videoUrl: string) => {
    const videoId = extractYouTubeId(videoUrl);
    return videoId
        ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        : null;
};

export const createVideoColumns = ({
    onView,
    onEdit,
    onDelete,
}: VideoTableColumnsProps): ColumnDef<Video>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="ml-2"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "sortOrder",
            header: () => (
                <div className="text-start font-semibold text-gray-700">No.</div>
            ),
            cell: ({ row }) => (
                <div className="font-medium text-gray-600">{row.index + 1}</div>
            ),
        },
        {
            accessorKey: "thumbnail",
            header: () => (
                <div className="font-semibold text-gray-700">Thumbnail</div>
            ),
            cell: ({ row }) => {
                const thumbnailUrl = getThumbnailUrl(row.original.youtubeVideoId);
                return (
                    <div className="flex items-center px-2">
                        {thumbnailUrl ? (
                            <img
                                src={thumbnailUrl}
                                alt={row.original.title}
                                className="w-20 h-12 object-cover rounded"
                            />
                        ) : (
                            <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <VideoIcon className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="font-semibold text-gray-700 hover:text-gray-900"
                >
                    Title
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="px-4 flex gap-2 items-center">
                    <div className="font-semibold text-gray-900">{row.original.title}</div>
                </div>
            ),
        },
        {
            accessorKey: "productModelNumber",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="font-semibold text-gray-700 hover:text-gray-900"
                >
                    Model No.
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="px-4 text-gray-600">
                    {row.original.productModelNumber}
                </div>
            ),
        },
        {
            accessorKey: "youtubeVideoId",
            header: () => <div className="font-semibold text-gray-700">Video URL</div>,
            cell: ({ row }) => {
                const videoId = extractYouTubeId(row.original.youtubeVideoId);
                return (
                    <div className="px-4">
                        {videoId ? (
                            <a
                                href={`https://www.youtube.com/watch?v=${videoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-500 hover:underline text-sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Watch
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        ) : (
                            <span className="text-xs text-gray-500">Invalid URL</span>
                        )}
                    </div>
                )
            }
        },
        {
            id: "actions",
            header: () => <div className="font-semibold text-gray-700">Actions</div>,
            enableHiding: false,
            cell: ({ row }) => {
                const video = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 rotate-90 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onView(video)}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onEdit(video)}
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(video.id)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
