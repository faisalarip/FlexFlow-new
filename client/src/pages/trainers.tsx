import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, DollarSign, Star, User, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TrainerWithServices } from "@shared/schema";

export default function Trainers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [maxRate, setMaxRate] = useState("");

  const { data: trainers, isLoading } = useQuery<TrainerWithServices[]>({
    queryKey: ["/api/trainers", { 
      ...(selectedSpecialty !== "all" && { specialties: selectedSpecialty }), 
      ...(maxRate && { maxRate: parseInt(maxRate) * 100 }),
      ...(searchQuery && { location: searchQuery })
    }],
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Trainer</h1>
          <p className="text-gray-600">Connect with certified personal trainers in your area</p>
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