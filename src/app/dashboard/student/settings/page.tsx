"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Camera, X, Check, AlertCircle } from "lucide-react";

interface UserProfile {
  name: string;
  registerNumber: string;
  department: string;
  year: string;
  classSection: string;
  photo_url?: string;
}

export default function StudentSettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name,
          registerNumber: data.registerNumber,
          department: data.department,
          year: data.year,
          classSection: data.classSection,
          photo_url: data.photo_url,
        });
      } else {
        showMessage("error", "Failed to load profile");
      }
    } catch (error) {
      showMessage("error", "Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showMessage("error", "Please select a JPEG, PNG, or WebP image");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", "Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);

      const res = await fetch("/api/auth/profile/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("success", "Profile photo updated successfully!");
        setProfile((prev) =>
          prev ? { ...prev, photo_url: data.photoUrl } : null,
        );
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        showMessage(
          "error",
          data.error || data.message || "Failed to upload photo",
        );
      }
    } catch (error) {
      showMessage("error", "Error uploading photo");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/auth/profile/image", {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("success", "Profile photo removed successfully!");
        setProfile((prev) => (prev ? { ...prev, photo_url: undefined } : null));
      } else {
        showMessage(
          "error",
          data.error || data.message || "Failed to remove photo",
        );
      }
    } catch (error) {
      showMessage("error", "Error removing photo");
    } finally {
      setDeleting(false);
    }
  };

  const cancelPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-sm text-muted-foreground">
            Failed to load profile
          </p>
          <Button onClick={fetchProfile} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const displayPhotoUrl = previewUrl || profile.photo_url;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your profile photo and view your details
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.type === "success" ? (
            <Check className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Photo Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Profile Photo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Photo Display */}
            <div className="relative flex-shrink-0">
              <div className="relative h-32 w-32 rounded-xl border-2 border-border overflow-hidden bg-secondary/20">
                {displayPhotoUrl ? (
                  <img
                    src={displayPhotoUrl}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              {previewUrl && (
                <div className="absolute -top-2 -right-2 bg-amber-500/20 text-amber-300 text-xs font-semibold px-2 py-1 rounded-full border border-amber-500/30">
                  Preview
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload a clear photo of yourself for QR entry verification.
                  This photo will be shown to coordinators when you scan your QR
                  code at the event.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    disabled={uploading || deleting}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {profile.photo_url ? "Change Photo" : "Upload Photo"}
                  </Button>
                  {profile.photo_url && (
                    <Button
                      onClick={handleDelete}
                      variant="outline"
                      disabled={uploading || deleting}
                      className="border-destructive/50 text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {deleting ? "Removing..." : "Remove Photo"}
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Preview Actions */}
              {previewUrl && (
                <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-300">
                      Ready to upload
                    </p>
                    <p className="text-xs text-amber-400/70 mt-0.5">
                      {selectedFile?.name} (
                      {(selectedFile!.size / 1024).toFixed(0)}KB)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpload}
                      size="sm"
                      disabled={uploading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                    <Button
                      onClick={cancelPreview}
                      size="sm"
                      variant="ghost"
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Accepted formats: JPEG, PNG, WebP</p>
                <p>• Maximum file size: 5MB</p>
                <p>• Use a clear, front-facing photo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Full Name</p>
              <p className="text-sm font-medium">{profile.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Register Number
              </p>
              <p className="text-sm font-medium font-mono">
                {profile.registerNumber}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Department</p>
              <p className="text-sm font-medium">{profile.department}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Year</p>
              <p className="text-sm font-medium">{profile.year}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Class Section
              </p>
              <p className="text-sm font-medium">{profile.classSection}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
