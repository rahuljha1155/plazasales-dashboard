//@ts-ignore issues
import React, { useState, useEffect } from "react";
import { Eye, Trash2, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { api } from "@/services/api";
import type { HomeGalleryType } from "@/types/homegalleryType";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Breadcrumb from "../dashboard/Breadcumb";
import { useUserStore } from "@/store/userStore";

const HomeGallery = () => {
  const navigate = useNavigate();
  const { id } = useParams();


  const [data, setData] = useState<{
    data: HomeGalleryType[];
    pagination: {
      count: number;
      total: number;
      page: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>({
    data: [],
    pagination: {
      count: 0,
      total: 0,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{
    id: string;
    publicId: string;
  } | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const links = [{ label: "Home-Gallery", isActive: true }];
  const { user } = useUserStore()

  const fetchImages = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await api.get(`/homegallery`, {
        params: { page, limit },
      });
      setData(response.data);
    } catch (error) {
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(currentPage, pageSize);
  }, [currentPage, pageSize, id]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string, publicId: string) => {
    try {
      setDeletingImageId(id);
      await api.delete(`/homegallery/${id}`, { data: { publicId } });
      await fetchImages(currentPage, pageSize);
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Failed to delete image");
    } finally {
      setDeletingImageId(null);
      setImageToDelete(null);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb links={links} />
        <Button
          onClick={() => navigate("/home-gallery/create")}
          className="flex items-center gap-2"
        >
          <Upload size={16} /> Upload Image
        </Button>
      </div>

      <div className="bg-white rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No images found. Upload your first image.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((image, index) => (
                <TableRow key={image.id}>
                  <TableCell className="w-24">
                    <div className="w-16 h-16">
                      <img
                        src={image.centerImage}
                        alt="Gallery image"
                        className="w-full h-full object-cover rounded-[2px]"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{image.sortOrder || 0}</TableCell>
                  <TableCell>
                    {format(new Date(image.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/home-gallery/view/${image.id}`)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/home-gallery/edit/${image.id}`)}
                        title="Edit"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageToDelete({
                            id: image.id,
                            publicId: image?.id,
                          });
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                        disabled={deletingImageId === image.id}
                        title="Delete"
                      >
                        {deletingImageId === image.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {data.pagination.count} of {data.pagination.total} images
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                className="h-8 w-[70px] rounded-[2px] border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(data.pagination.page - 1)}
                disabled={!data.pagination.hasPreviousPage}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(data.pagination.page + 1)}
                disabled={!data.pagination.hasNextPage}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. It will permanently delete the selected item.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setImageToDelete(null);
              }}
              disabled={!!deletingImageId}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (imageToDelete) {
                  await handleDelete(imageToDelete.id, imageToDelete.publicId);
                }
              }}
              className="text-white"
              disabled={!!deletingImageId}
            >
              {deletingImageId ? (
                <div className="flex items-center text-white gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Confirming...
                </div>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeGallery;
