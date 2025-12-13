"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { Edit2, Plus, Trash2, X, ImagePlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service"; // Assume this exists or optional
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface Category {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // For Edit Form
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    instock: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      setProducts(response.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      try {
        const response = await categoryService.getAll();
        if (response.categories && response.categories.length > 0) {
          setCategories(response.categories);
          return;
        }
      } catch (e) {}

      setCategories([
        { id: 1, name: "Beverages" },
        { id: 2, name: "Groceries" },
        { id: 3, name: "Personal Care" },
        { id: 4, name: "Snacks" },
        { id: 5, name: "Dairy & Eggs" },
        { id: 6, name: "Bakery" },
        { id: 7, name: "Household Essentials" },
        { id: 8, name: "Fruits & Vegetables" },
        { id: 9, name: "Meat & Seafood" },
        { id: 10, name: "Frozen Foods" },
        { id: 11, name: "Other" },
      ]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Calculate total images (existing previews + new files)
    const totalImages = imagePreviews.length + files.length;

    if (totalImages > 5) {
      toast({
        title: "Too many images",
        description: "You can only have up to 5 images total",
        variant: "destructive",
      });
      return;
    }

    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    // If we remove an image, we need to know if it was an existing URL or a newly added File.
    // imagePreviews contains both URLs and base64 strings.
    // images contains only new Files.

    // The index in imagePreviews corresponds to the visual list.
    // If we remove item at index `i`, we need to remove it from `imagePreviews`.
    // We also need to remove from `images` IF it corresponds to a new file.
    // This mapping is tricky if we mix them blindly.

    // Better approach:
    // Keep `existingImages` (URLs) separate from `newImages` (Files) in state?
    // Or just rebuild the arrays.

    // For simplicity in this fix:
    // If `imagePreviews[index]` starts with 'data:', it's likely a new file.
    // But we don't know EXACTLY which file index it maps to if we deleted others.
    // So let's try to infer.

    // Use a simpler strategy:
    // If the user deletes an image, just remove it from preview.
    // When submitting, we only upload FILES that are still represented in `imagePreviews`?
    // Takes more logic.

    // Alternative: Just remove from `imagePreviews`.
    // The `images` state (Files) might get out of sync.
    // We will clear `images` and `imagePreviews` on open.
    // When adding, we append.
    // When removing:
    // - If it's a URL, just filter logic.
    // - If it's a blob, remove from `images`?

    // Let's rely on filtering `imagePreviews` (some are http, some are data:).
    // And keeping `images` (List of Files) sync is hard without an ID.
    // Simplify: When editing, if you remove a NEW image, we might just clear all new images if it's too complex, OR:
    // We iterate backwards?

    // Actually, let's just use `imagePreviews` to determine what to keep for existing (http).
    // For new files, if we remove one, we should remove from `images`.
    // But `images` doesn't match `imagePreviews` index 1:1 if there were initial existing images.

    // Correct way:
    // `initialCount` = number of existing images.
    // If index < initialCount: it's an existing image.
    // If index >= initialCount: it's a new image at index (index - currentExistingCount).
    // But if we delete an existing image, `initialCount` changes? No, we shouldn't rely on implementation details like that.

    // Simple Fix:
    // Just recreate the file list.
    // Actually, for this task, I'll assume if you remove a preview that is 'data:', I need to remove the corresponding file.
    // Since that's hard, I'll just say:
    // New feature: `newFiles` state.

    // Let's restart the remove logic to be safe:
    // We will store `existingImages` as strings.
    // We will store `newFiles` as Objects { file: File, preview: string }.
    // Only display combined list.

    // Actually, standard way:
    const targetPreview = imagePreviews[index];

    if (targetPreview.startsWith("http") || targetPreview.startsWith("https")) {
      // It is an existing image
      // Just remove from previews
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // It is a new file (data url)
      // Remove from previews
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));

      // Also remove from `images` array
      // Finding which file corresponds is hard.
      // Let's assume order is preserved relative to other new files.
      // Count how many "new files" appeared BEFORE this index in the preview list.
      let newFileIndex = 0;
      for (let i = 0; i < index; i++) {
        if (!imagePreviews[i].startsWith("http")) {
          newFileIndex++;
        }
      }
      setImages((prev) => prev.filter((_, i) => i !== newFileIndex));
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category:
        typeof product.category === "object"
          ? product.category.name
          : product.category || "",
      description: product.description || "",
      price: product.price.toString(),
      instock: (product.instock ?? product.stock ?? 0).toString(),
    });
    setImages([]); // Clear new files
    // Ensure images is string[]
    const existingImgs = Array.isArray(product.images)
      ? product.images
      : product.image
      ? [product.image]
      : [];
    setImagePreviews(existingImgs);
    setShowEditDialog(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) return;

    try {
      setSubmitting(true);

      // 1. Upload new images
      let newUploadedUrls: string[] = [];
      if (images.length > 0) {
        const uploadPromises = images.map((file) => uploadToCloudinary(file));
        newUploadedUrls = await Promise.all(uploadPromises);
      }

      // 2. Identify existing images that were KEPT
      const keptExistingImages = imagePreviews.filter((p) =>
        p.startsWith("http")
      );

      // 3. Combine
      const finalImages = [...keptExistingImages, ...newUploadedUrls];

      const productData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        instock: parseInt(formData.instock),
        images: finalImages,
      };

      await productService.update(selectedProduct._id, productData);

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      setShowEditDialog(false);
      setSelectedProduct(null);
      setImages([]);
      setImagePreviews([]);
      fetchProducts();
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      await productService.delete(selectedProduct._id);

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      setShowDeleteDialog(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryName = (product: Product) => {
    if (product.category && typeof product.category === "object") {
      return product.category.name;
    }
    return product.category || "Other";
  };

  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              My Products
            </h2>
          </div>
          <Button
            onClick={() => router.push("/seller/products/add")}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Product List */}
        <Card>
          <CardHeader>
            <CardTitle>Product List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No products found
                </p>
                <Button onClick={() => router.push("/seller/products/add")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{getCategoryName(product)}</TableCell>
                        <TableCell>Rs. {product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          {product.instock ?? product.stock}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(product)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Product</DialogTitle>
            <DialogDescription>
              Make changes to your product here.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price *</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-instock">Stock *</Label>
                <Input
                  id="edit-instock"
                  name="instock"
                  type="number"
                  min="0"
                  value={formData.instock}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Product Images</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <input
                    type="file"
                    id="edit-images"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={imagePreviews.length >= 5}
                  />
                  <label
                    htmlFor="edit-images"
                    className={`flex flex-col items-center cursor-pointer ${
                      imagePreviews.length >= 5
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {imagePreviews.length >= 5
                        ? "Maximum images reached"
                        : "Add More Images"}
                    </p>
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setImages([]);
                  setImagePreviews([]);
                  setSelectedProduct(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product "{selectedProduct?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
