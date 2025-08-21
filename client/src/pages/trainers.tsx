import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, MapPin, DollarSign, Star, User, Clock, Plus, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { TrainerWithServices, Trainer } from "@shared/schema";

const trainerSignupSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  specialties: z.array(z.string()).min(1, "Select at least one specialty"),
  experience: z.string().min(1, "Experience is required"),
  hourlyRate: z.string().min(1, "Hourly rate is required"),
  location: z.string().optional(),
  certifications: z.array(z.string()).optional(),
});

export default function Trainers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [maxRate, setMaxRate] = useState("");
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trainers, isLoading } = useQuery<TrainerWithServices[]>({
    queryKey: ["/api/trainers", { 
      ...(selectedSpecialty !== "all" && { specialties: selectedSpecialty }), 
      ...(maxRate && { maxRate: parseInt(maxRate) * 100 }),
      ...(searchQuery && { location: searchQuery })
    }],
  });

  const { data: currentUserTrainer } = useQuery<Trainer>({
    queryKey: ["/api/trainers/me"],
    retry: false,
  });

  const form = useForm<z.infer<typeof trainerSignupSchema>>({
    resolver: zodResolver(trainerSignupSchema),
    defaultValues: {
      bio: "",
      specialties: [],
      experience: "",
      hourlyRate: "",
      location: "",
      certifications: [],
    },
  });

  const createTrainerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof trainerSignupSchema>) => {
      const response = await apiRequest("POST", "/api/trainers", {
        bio: data.bio,
        specialties: data.specialties,
        experience: parseInt(data.experience),
        hourlyRate: parseInt(data.hourlyRate) * 100, // Convert to cents
        location: data.location || null,
        certifications: data.certifications || [],
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "You're now registered as a trainer!" });
      queryClient.invalidateQueries({ queryKey: ["/api/trainers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainers/me"] });
      setShowSignupDialog(false);
      form.reset();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to register as trainer", 
        variant: "destructive" 
      });
    }
  });

  const specialties = [
    { value: "all", label: "All Specialties" },
    { value: "strength", label: "Strength Training" },
    { value: "cardio", label: "Cardio" },
    { value: "yoga", label: "Yoga" },
    { value: "weight-loss", label: "Weight Loss" },
    { value: "bodybuilding", label: "Bodybuilding" },
    { value: "flexibility", label: "Flexibility" },
    { value: "mindfulness", label: "Mindfulness" }
  ];

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const formatRating = (rating: number | null) => rating ? (rating / 100).toFixed(1) : "New";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Trainer</h1>
              <p className="text-gray-600">Connect with certified personal trainers in your area</p>
            </div>
            
            {!currentUserTrainer && (
              <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Award size={16} />
                    <span>Become a Trainer</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Become a Certified Trainer</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => createTrainerMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell clients about your training philosophy, experience, and what makes you unique..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years of Experience</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" placeholder="5" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hourlyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hourly Rate ($)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" placeholder="75" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="New York, NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialties"
                        render={() => (
                          <FormItem>
                            <FormLabel>Specialties</FormLabel>
                            <div className="grid grid-cols-2 gap-3">
                              {specialties.slice(1).map((specialty) => (
                                <FormField
                                  key={specialty.value}
                                  control={form.control}
                                  name="specialties"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={specialty.value}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(specialty.value)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, specialty.value])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== specialty.value
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {specialty.label}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="certifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certifications (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List your certifications, one per line (e.g., ACSM-CPT, NASM-CPT)"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value.split('\n').filter(cert => cert.trim()))}
                                value={field.value?.join('\n') || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowSignupDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createTrainerMutation.isPending}
                        >
                          {createTrainerMutation.isPending ? "Creating..." : "Become a Trainer"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}

            {currentUserTrainer && (
              <div className="text-right">
                <Badge variant="secondary" className="mb-2">
                  <Award className="mr-1" size={14} />
                  Trainer
                </Badge>
                <p className="text-sm text-gray-600">You're already a registered trainer!</p>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search by location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(specialty => (
                  <SelectItem key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Max rate per hour"
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
            />

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialty("all");
                setMaxRate("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Trainers Grid */}
        {trainers && trainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <Card key={trainer.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <User className="text-white" size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{trainer.user.name}</CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          {trainer.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="text-yellow-400 fill-current" size={14} />
                              <span>{formatRating(trainer.rating)}</span>
                              <span>({trainer.totalReviews} reviews)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatPrice(trainer.hourlyRate)}/hr</p>
                      <p className="text-xs text-gray-500">{trainer.experience} years exp</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{trainer.bio}</p>
                  
                  <div className="space-y-3">
                    {/* Specialties */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">SPECIALTIES</p>
                      <div className="flex flex-wrap gap-1">
                        {trainer.specialties.slice(0, 3).map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {trainer.specialties.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{trainer.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    {trainer.location && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>{trainer.location}</span>
                      </div>
                    )}

                    {/* Services */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">SERVICES</p>
                      <div className="space-y-1">
                        {trainer.services.slice(0, 2).map((service) => (
                          <div key={service.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Clock size={12} className="text-gray-400" />
                              <span>{service.name}</span>
                              <span className="text-gray-400">({service.duration}min)</span>
                            </div>
                            <span className="font-medium text-primary">
                              {formatPrice(service.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full mt-4">
                      View Profile & Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trainers found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}