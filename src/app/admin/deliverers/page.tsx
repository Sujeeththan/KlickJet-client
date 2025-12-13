"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import { User } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// Use User type directly since the API returns User objects
type Deliverer = User;

const ITEMS_PER_PAGE = 10;

export default function DeliverersPage() {
  // const { token } = useAuth();
  const [allDeliverers, setAllDeliverers] = useState<Deliverer[]>([]);
  const [filteredDeliverers, setFilteredDeliverers] = useState<Deliverer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedDeliverer, setSelectedDeliverer] = useState<Deliverer | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterDeliverers();
  }, [allDeliverers, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllDeliverers();
      setAllDeliverers(response.deliverers || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch deliverers");
    } finally {
      setLoading(false);
    }
  };

  const filterDeliverers = () => {
    if (statusFilter === "all") {
      setFilteredDeliverers(allDeliverers);
    } else {
      setFilteredDeliverers(
        allDeliverers.filter((deliverer) => deliverer.status === statusFilter)
      );
    }
    setCurrentPage(1);
  };

  const handleApproveClick = (deliverer: Deliverer) => {
    setSelectedDeliverer(deliverer);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (deliverer: Deliverer) => {
    setSelectedDeliverer(deliverer);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleDeleteClick = (deliverer: Deliverer) => {
    setSelectedDeliverer(deliverer);
    setDeleteDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedDeliverer) return;

    setActionLoading(selectedDeliverer._id);
    try {
      await userService.approveDeliverer(selectedDeliverer._id);
      toast.success("Deliverer approved successfully");
      setApproveDialogOpen(false);
      setSelectedDeliverer(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve deliverer");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmReject = async () => {
    if (!selectedDeliverer) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(selectedDeliverer._id);
    try {
      await userService.rejectDeliverer(selectedDeliverer._id, rejectionReason);
      toast.success("Deliverer rejected successfully");
      setRejectDialogOpen(false);
      setSelectedDeliverer(null);
      setRejectionReason("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject deliverer");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (!selectedDeliverer) return;

    setActionLoading(selectedDeliverer._id);
    try {
      await userService.deleteDeliverer(selectedDeliverer._id);
      toast.success("Deliverer deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedDeliverer(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete deliverer");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge>Unknown</Badge>;
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
        );
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredDeliverers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDeliverers = filteredDeliverers.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Deliverers</h2>
          <p className="text-muted-foreground">
            Manage deliverer applications and approvals
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deliverer Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Vehicle Type</TableHead>
                      <TableHead>Vehicle No</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentDeliverers.length > 0 ? (
                      currentDeliverers.map((deliverer) => (
                        <TableRow key={deliverer._id}>
                          <TableCell className="font-medium">
                            {deliverer.name}
                          </TableCell>
                          <TableCell>{deliverer.email}</TableCell>
                          <TableCell>{deliverer.phone_no}</TableCell>
                          <TableCell>
                            {deliverer.vehicle_type || "N/A"}
                          </TableCell>
                          <TableCell>{deliverer.vehicle_no || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(deliverer.status)}
                              {deliverer.status === "rejected" &&
                                deliverer.rejectionReason && (
                                  <span className="text-xs text-muted-foreground">
                                    Reason: {deliverer.rejectionReason}
                                  </span>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(deliverer.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {deliverer.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() =>
                                      handleApproveClick(deliverer)
                                    }
                                    disabled={actionLoading === deliverer._id}
                                  >
                                    {actionLoading === deliverer._id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleRejectClick(deliverer)}
                                    disabled={actionLoading === deliverer._id}
                                  >
                                    {actionLoading === deliverer._id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                onClick={() => handleDeleteClick(deliverer)}
                                disabled={actionLoading === deliverer._id}
                              >
                                {actionLoading === deliverer._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No deliverers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                  <p className="text-sm text-muted-foreground order-2 sm:order-1">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredDeliverers.length)} of{" "}
                    {filteredDeliverers.length} deliverers
                  </p>
                  <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-2 sm:hidden">
                      <span className="text-sm">
                        {currentPage} / {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Deliverer</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedDeliverer?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveDialogOpen(false);
                setSelectedDeliverer(null);
              }}
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={actionLoading !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Confirm Approve"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog with Reason */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Deliverer</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedDeliverer?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setSelectedDeliverer(null);
                setRejectionReason("");
              }}
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={actionLoading !== null || !rejectionReason.trim()}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Confirm Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deliverer</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              {selectedDeliverer?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedDeliverer(null);
              }}
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={actionLoading !== null}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
