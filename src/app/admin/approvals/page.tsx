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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// Mock data - replace with API call
const mockPendingUsers = [
  {
    id: "1",
    name: "John's Electronics",
    email: "john@example.com",
    role: "seller",
    status: "pending",
    date: "2023-11-25",
  },
  {
    id: "2",
    name: "Fast Delivery Co",
    email: "rider@example.com",
    role: "deliverer",
    status: "pending",
    date: "2023-11-26",
  },
];

export default function ApprovalsPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [sellersRes, deliverersRes] = await Promise.all([
          adminApi.getPendingSellers(token),
          adminApi.getPendingDeliverers(token),
        ]);
        
        const sellers = sellersRes.sellers.map((s: any) => ({ ...s, role: "seller" }));
        const deliverers = deliverersRes.deliverers.map((d: any) => ({ ...d, role: "deliverer" }));
        
        setUsers([...sellers, ...deliverers]);
      } catch (error) {
        toast.error("Failed to fetch pending approvals");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleAction = (user: any, actionType: "approve" | "reject") => {
    setSelectedUser(user);
    setAction(actionType);
  };

  const confirmAction = async () => {
    if (!selectedUser || !action || !token) return;

    try {
      if (selectedUser.role === "seller") {
        if (action === "approve") {
          await adminApi.approveSeller(token, selectedUser._id);
        } else {
          await adminApi.rejectSeller(token, selectedUser._id);
        }
      } else {
        if (action === "approve") {
          await adminApi.approveDeliverer(token, selectedUser._id);
        } else {
          await adminApi.rejectDeliverer(token, selectedUser._id);
        }
      }

      toast.success(`User ${selectedUser.name} ${action}d successfully`);
      setUsers(users.filter((u) => u._id !== selectedUser._id));
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    } finally {
      setSelectedUser(null);
      setAction(null);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Pending Approvals</h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.status}</Badge>
                </TableCell>
                <TableCell>{user.date}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAction(user, "approve")}
                      >
                        Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Registration</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to approve {user.name} as a {user.role}?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
                        <Button onClick={confirmAction}>Confirm Approve</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction(user, "reject")}
                      >
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Registration</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to reject {user.name}? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmAction}>Confirm Reject</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
