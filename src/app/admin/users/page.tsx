"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import { User } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/StatusBadge";

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  // const { token } = useAuth(); // Token handled by cookie
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [allUsers, roleFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers();
      setAllUsers(response.users || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (roleFilter === "all") {
      setFilteredUsers(allUsers);
    } else {
      setFilteredUsers(
        allUsers.filter((user) => {
          const uRole = (user.role || "").toLowerCase();
          const uType = (user.type || "").toLowerCase();
          const filter = roleFilter.toLowerCase();
          
          // Direct match
          if (uRole === filter || uType === filter) return true;
          
          // Map 'user' to 'customer' if that's how backend returns it
          if (filter === 'customer' && (uRole === 'user' || uType === 'user')) return true;
          
          return false;
        })
      );
    }
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">View all users in the system</p>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="deliverer">Deliverer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
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
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">
                            {user.email}
                          </TableCell>
                          <TableCell>{user.shopName || user.name}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{user.role}</Badge></TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {user.status && (
                                user.status.toLowerCase() === 'approved' || user.status.toLowerCase() === 'active' ? (
                                  <StatusBadge status="active" />
                                ) : user.status.toLowerCase() === 'pending' ? (
                                  <StatusBadge status="pending" />
                                ) : user.status.toLowerCase() === 'rejected' ? (
                                  <StatusBadge status="rejected" />
                                ) : user.status.toLowerCase() === 'inactive' ? (
                                  <StatusBadge status="inactive" />
                                ) : (
                                  <Badge>{user.status}</Badge>
                                )
                              )}
                              {user.status === "rejected" &&
                                user.rejectionReason && (
                                  <span className="text-xs text-muted-foreground">
                                    Reason: {user.rejectionReason}
                                  </span>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredUsers.length)} of{" "}
                    {filteredUsers.length} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
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
    </div>
  );
}
