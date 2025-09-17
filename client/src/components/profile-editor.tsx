import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { User2, Edit2, Save, X, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface ProfileEditorProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function ProfileEditor({ trigger, isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }: ProfileEditorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user data
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Set form values when user data loads
  useEffect(() => {
    if (user && isOpen) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setProfileImagePreview(user.profileImageUrl || null);
      setProfileImage(null);
    }
  }, [user, isOpen]);

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { firstName: string; lastName: string; profileImage?: File }) => {
      if (profileData.profileImage) {
        // Upload image first
        const formData = new FormData();
        formData.append('profileImage', profileData.profileImage);
        formData.append('firstName', profileData.firstName);
        formData.append('lastName', profileData.lastName);
        
        const response = await fetch('/api/user/profile/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload profile image');
        }
        
        return response.json();
      } else {
        // Update name only
        const response = await apiRequest("PATCH", "/api/user/profile", {
          firstName: profileData.firstName,
          lastName: profileData.lastName
        });
        return response.json();
      }
    },
    onSuccess: (updatedUser) => {
      // Update the cached user data
      queryClient.setQueryData(["/api/auth/user"], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Profile Updated", 
        description: profileData.profileImage ? "Your profile picture and information have been updated successfully!" : "Your profile information has been updated successfully!",
      });
      
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (PNG, JPG, GIF, etc.).",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImagePreview(reader.result as string);
        toast({
          title: "Image Selected",
          description: "Profile picture ready to upload!",
        });
      };
      reader.onerror = () => {
        toast({
          title: "Error Reading File",
          description: "Failed to process the selected image.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() && !lastName.trim() && !profileImage) {
      toast({
        title: "Update Required",
        description: "Please enter at least your name or select a profile picture.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      profileImage: profileImage || undefined,
    });
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setProfileImage(null);
    setProfileImagePreview(user?.profileImageUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsOpen(false);
  };

  const currentName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : null;
  const displayName = currentName || user?.email || "User";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800" data-testid="edit-profile-button">
            <User2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" data-testid="profile-editor-dialog">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User2 className="w-5 h-5 text-primary" />
              Edit Your Profile
            </DialogTitle>
            <DialogDescription>
              Update your profile picture and name to personalize your experience.
              Currently greeting as: <strong>{displayName}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Profile Picture Section */}
            <div className="grid gap-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                    {profileImagePreview ? (
                      <img 
                        src={profileImagePreview} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                        data-testid="profile-image-preview"
                      />
                    ) : (
                      <User2 className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
                    data-testid="upload-image-button"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    data-testid="choose-image-button"
                  >
                    <Upload className="w-4 h-4" />
                    Choose New Image
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                data-testid="file-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                maxLength={50}
                data-testid="input-first-name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                maxLength={50}
                data-testid="input-last-name"
              />
            </div>
            
            {(firstName.trim() || lastName.trim() || profileImage) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Preview:</strong> Your greeting will be "Good [time], {firstName.trim()} {lastName.trim()}!"
                  {profileImage && (
                    <span className="block mt-1">✓ New profile picture will be uploaded</span>
                  )}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={updateProfileMutation.isPending}
              data-testid="button-cancel"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending || (!firstName.trim() && !lastName.trim() && !profileImage)}
              data-testid="button-save"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfileMutation.isPending ? "Uploading..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}