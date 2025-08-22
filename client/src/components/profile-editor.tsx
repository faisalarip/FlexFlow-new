import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { User2, Edit2, Save, X } from "lucide-react";
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
}

export default function ProfileEditor({ trigger }: ProfileEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
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
    }
  }, [user, isOpen]);

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { firstName: string; lastName: string }) => {
      const response = await apiRequest("PATCH", "/api/user/profile", profileData);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      // Update the cached user data
      queryClient.setQueryData(["/api/auth/user"], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Profile Updated",
        description: "Your name has been updated successfully!",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() && !lastName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter at least your first name or last name.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
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
              Edit Your Name
            </DialogTitle>
            <DialogDescription>
              Update your first and last name to personalize your greeting and profile.
              Currently greeting as: <strong>{displayName}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
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
            
            {(firstName.trim() || lastName.trim()) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Preview:</strong> Your greeting will be "Good [time], {firstName.trim()} {lastName.trim()}!"
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
              disabled={updateProfileMutation.isPending || (!firstName.trim() && !lastName.trim())}
              data-testid="button-save"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}