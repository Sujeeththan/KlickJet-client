"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { sellerService, authService } from "@/services/api";
import { Camera, Loader2, Store } from "lucide-react";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function SellerSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  // Initialize with context user, but update with fresh fetch
  const [shopImage, setShopImage] = useState<string | null>(user?.shopImage || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.shopImage || null);

  // Fetch fresh user data on mount to ensure we have the latest image
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser && (currentUser as any).shopImage) {
            setShopImage((currentUser as any).shopImage);
            setPreviewUrl((currentUser as any).shopImage);
        }
      } catch (error) {
        console.error("Failed to fetch fresh user data", error);
      }
    };
    fetchUserData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedImageUrl = shopImage;

      // Upload new image if selected
      if (imageFile) {
        uploadedImageUrl = await uploadToCloudinary(imageFile);
      }

      // Update backend
      if (user?._id) {
          const updateData = {
              shopImage: uploadedImageUrl
          };
          
          await sellerService.updateSellerProfile(user._id, updateData);

          // Update local state and ideally AuthContext (refresh user)
          await refreshUser();
          setShopImage(uploadedImageUrl);
          
          toast({
            title: "Success",
            description: "Shop settings updated successfully. Please re-login to see changes in header if visible.",
          });
      }

    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Shop Settings</h2>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Shop Branding</CardTitle>
            <CardDescription>
              Manage your shop's visual appearance on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Shop Image</Label>
                    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-muted/50">
                        <div className="relative h-48 w-full md:w-80 rounded-lg overflow-hidden border bg-background flex items-center justify-center">
                            {previewUrl ? (
                                <Image 
                                    src={previewUrl} 
                                    alt="Shop Preview" 
                                    fill 
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-muted-foreground">
                                    <Store className="h-12 w-12 mb-2" />
                                    <span>No image uploaded</span>
                                </div>
                            )}
                            
                            {/* Overlay for hover */}
                            <label 
                                htmlFor="shop-image-upload" 
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white font-medium"
                            >
                                <Camera className="mr-2 h-5 w-5" />
                                Change Image
                            </label>
                        </div>
                        
                        <input 
                            id="shop-image-upload" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageChange}
                        />
                        
                        <p className="text-xs text-muted-foreground text-center max-w-sm">
                            Recommended size: 800x600px. Max size: 5MB. 
                            Supported formats: JPG, PNG, WEBP.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="shopName">Shop Name</Label>
                        <Input id="shopName" value={user?.shopName || ''} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">Contact admin to change shop name.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user?.email || ''} disabled className="bg-muted" />
                    </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
