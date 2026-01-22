import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllSeoMetadata, useDeleteSeoMetadata } from "@/services/seoMetadata";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MoreVertical, Eye, Pencil, Trash2, Search } from "lucide-react";
import { EntityType } from "@/types/ISeoMetadata";
import { Pagination } from "@/components/Pagination";

export default function SeoMetadataList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityType | "ALL">("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useGetAllSeoMetadata({
    page,
    limit,
    search: search || undefined,
    entityType: entityTypeFilter !== "ALL" ? entityTypeFilter : undefined,
  });

  const deleteMutation = useDeleteSeoMetadata();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (error) {
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Error loading SEO metadata: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>SEO Metadata</CardTitle>
            <CardDescription>Manage SEO metadata for all your content</CardDescription>
          </div>
          <Button onClick={() => navigate("/dashboard/seo-metadata/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Add SEO Metadata
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by slug or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={entityTypeFilter}
              onValueChange={(value) => setEntityTypeFilter(value as EntityType | "ALL")}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {Object.values(EntityType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Slug</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data && data.data.seoMetadata.length > 0 ? (
                      data.data.seoMetadata.map((seo) => (
                        <TableRow key={seo.id}>
                          <TableCell className="font-medium">{seo.slug}</TableCell>
                          <TableCell className="max-w-xs truncate">{seo.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{seo.entityType}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {seo.isIndexable && (
                                <Badge variant="secondary" className="text-xs">
                                  Indexable
                                </Badge>
                              )}
                              {seo.isOptimized && (
                                <Badge variant="secondary" className="text-xs">
                                  Optimized
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(seo.updatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/dashboard/seo-metadata/view/${seo.id}`)
                                  }
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/dashboard/seo-metadata/edit/${seo.id}`)
                                  }
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteId(seo.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No SEO metadata found. Create your first entry!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {data?.data.total && data.data.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={page}
                    totalPages={data.data.totalPages}
                    totalItems={data.data.total}
                    itemsPerPage={limit}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the SEO metadata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
