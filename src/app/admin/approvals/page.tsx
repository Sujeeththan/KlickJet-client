"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { adminApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface User {
  _id: string;
  name: string;
  shopName?: string;
  email: string;
  phone_no?: string;
  status: string;
  role: string;
  createdAt: string;
  rejectionReason?: string;
}

export default function ApprovalsPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Reject modal state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Approve modal state
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  
  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
  }, [token]);

  const fetchPendingUsers = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const [sellersRes, deliverersRes] = await Promise.all([
        adminApi.getPendingSellers(token),
        adminApi.getPendingDeliverers(token),
      ]);

      const sellers = sellersRes.sellers.map((s: any) => ({
        ...s,
        role: "seller",
      }));
      const deliverers = deliverersRes.deliverers.map((d: any) => ({
        ...d,
        role: "deliverer",
      }));

      setUsers([...sellers, ...deliverers]);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch pending approvals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveClick = (user: User) => {
    setSelectedUser(user);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (user: User) => {
    setSelectedUser(user);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedUser || !token) return;

    setActionLoading(selectedUser._id);
    try {
      if (selectedUser.role === "seller") {
        await adminApi.approveSeller(token, selectedUser._id);
      } else {
        await adminApi.approveDeliverer(token, selectedUser._id);
      }

      toast.success(`${selectedUser.name} approved successfully`);
      setApproveDialogOpen(false);
      setSelectedUser(null);
      fetchPendingUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmReject = async () => {
    if (!selectedUser || !token) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(selectedUser._id);
    try {
      if (selectedUser.role === "seller") {
        await adminApi.rejectSeller(token, selectedUser._id, rejectionReason);
      } else {
        await adminApi.rejectDeliverer(token, selectedUser._id, rejectionReason);
      }

      toast.success(`${selectedUser.name} rejected successfully`);
      setRejectDialogOpen(false);
      setSelectedUser(null);
      setRejectionReason("");
      fetchPendingUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser || !token) return;

    setActionLoading(selectedUser._id);
    try {
      if (selectedUser.role === "seller") {
        await adminApi.deleteSeller(token, selectedUser._id);
      } else {
        await adminApi.deleteDeliverer(token, selectedUser._id);
      }

      toast.success(`${selectedUser.name} deleted successfully`);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchPendingUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pending Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve seller and deliverer registrations
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No pending approvals
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">
                    {user.shopName || user.name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.phone_no || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleApproveClick(user)}
                        disabled={actionLoading === user._id}
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRejectClick(user)}
                        disabled={actionLoading === user._id}
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                        onClick={() => handleDeleteClick(user)}
                        disabled={actionLoading === user._id}
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
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
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedUser?.shopName || selectedUser?.name} as a{" "}
              {selectedUser?.role}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveDialogOpen(false);
                setSelectedUser(null);
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
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedUser?.shopName || selectedUser?.name}.
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
                setSelectedUser(null);
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
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {selectedUser?.shopName || selectedUser?.name}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedUser(null);
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
