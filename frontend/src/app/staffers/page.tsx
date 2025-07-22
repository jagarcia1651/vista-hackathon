"use client";

import { StafferModal } from "@/components/staffers/StafferModal";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Staffer, stafferService } from "./services/stafferService";

export default function StaffersPage() {
   const [staffers, setStaffers] = useState<Staffer[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [searchQuery, setSearchQuery] = useState("");
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedStaffer, setSelectedStaffer] = useState<Staffer | null>(null);
   const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

   // Load staffers on component mount
   useEffect(() => {
      loadStaffers();
   }, []);

   const loadStaffers = async () => {
      setLoading(true);
      setError("");

      try {
         const result = await stafferService.getAllStaffers();
         if (result.error) {
            setError(result.error);
         } else {
            setStaffers(result.data || []);
         }
      } catch (err) {
         setError("Failed to load staffers");
      } finally {
         setLoading(false);
      }
   };

   const handleSearch = async (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
         loadStaffers();
         return;
      }

      setLoading(true);
      const result = await stafferService.searchStaffers(query);

      if (result.error) {
         setError(result.error);
      } else {
         setStaffers(result.data || []);
      }
      setLoading(false);
   };

   const handleCreateNew = () => {
      setSelectedStaffer(null);
      setIsModalOpen(true);
   };

   const handleEditStaffer = (staffer: Staffer) => {
      setSelectedStaffer(staffer);
      setIsModalOpen(true);
   };

   const handleDeleteStaffer = async (staffer: Staffer) => {
      if (!staffer.id) return;

      const confirmed = window.confirm(
         `Are you sure you want to delete ${staffer.first_name} ${staffer.last_name}? This action cannot be undone.`
      );

      if (!confirmed) return;

      setDeleteLoading(staffer.id);

      const result = await stafferService.deleteStaffer(staffer.id);

      if (result.error) {
         setError(result.error);
      } else {
         // Refresh the list
         loadStaffers();
      }

      setDeleteLoading(null);
   };

   const handleModalSuccess = () => {
      loadStaffers(); // Refresh the list after create/update
   };

   const getCapacityColor = (capacity: number) => {
      if (capacity >= 45) return "text-red-600 bg-red-50"; // Over 45 hours - high workload
      if (capacity >= 35) return "text-green-600 bg-green-50"; // 35-45 hours - good utilization
      if (capacity >= 20) return "text-orange-600 bg-orange-50"; // 20-35 hours - part-time
      return "text-slate-600 bg-slate-50"; // Under 20 hours - low capacity
   };

   const formatCapacity = (capacity: number) => {
      return `${capacity}h/week`;
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
               <div className="flex items-center justify-center py-12">
                  <div className="text-lg text-slate-600">
                     Loading staffers...
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-slate-50">
         <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
               <div className="flex items-center justify-between">
                  <div>
                     <h1 className="text-3xl font-semibold text-slate-900">
                        Staffers
                     </h1>
                     <p className="text-lg text-slate-600 mt-2">
                        Manage your team members and their information
                     </p>
                  </div>
                  <Button onClick={handleCreateNew}>Create New Staffer</Button>
               </div>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
               <CardHeader>
                  <CardTitle>Search Staffers</CardTitle>
                  <CardDescription>
                     Search by name or email address
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="flex gap-4">
                     <div className="flex-1">
                        <Input
                           type="text"
                           placeholder="Search by name or email..."
                           value={searchQuery}
                           onChange={(e) => handleSearch(e.target.value)}
                        />
                     </div>
                     {searchQuery && (
                        <Button
                           variant="outline"
                           onClick={() => handleSearch("")}
                        >
                           Clear Search
                        </Button>
                     )}
                  </div>
               </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
                  {error}
               </div>
            )}

            {/* Staffers List */}
            <Card>
               <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                     {staffers.length} staffer{staffers.length !== 1 ? "s" : ""}{" "}
                     found
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  {staffers.length === 0 ? (
                     <div className="text-center py-8">
                        <div className="text-slate-500 text-lg mb-4">
                           {searchQuery
                              ? "No staffers found matching your search"
                              : "No staffers found"}
                        </div>
                        <Button onClick={handleCreateNew}>
                           Create Your First Staffer
                        </Button>
                     </div>
                  ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full">
                           <thead>
                              <tr className="border-b border-slate-200">
                                 <th className="text-left py-3 px-4 font-medium text-slate-900">
                                    Name
                                 </th>
                                 <th className="text-left py-3 px-4 font-medium text-slate-900">
                                    Email
                                 </th>
                                 <th className="text-left py-3 px-4 font-medium text-slate-900">
                                    Title
                                 </th>
                                 <th className="text-left py-3 px-4 font-medium text-slate-900">
                                    Time Zone
                                 </th>
                                 <th className="text-left py-3 px-4 font-medium text-slate-900">
                                    Weekly Capacity
                                 </th>
                                 <th className="text-right py-3 px-4 font-medium text-slate-900">
                                    Actions
                                 </th>
                              </tr>
                           </thead>
                           <tbody>
                              {staffers.map((staffer) => (
                                 <tr
                                    key={staffer.id}
                                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                    onClick={() => handleEditStaffer(staffer)}
                                 >
                                    <td className="py-3 px-4">
                                       <div className="font-medium text-slate-900">
                                          {staffer.first_name}{" "}
                                          {staffer.last_name}
                                       </div>
                                    </td>
                                    <td className="py-3 px-4">
                                       <div className="text-slate-600">
                                          {staffer.email}
                                       </div>
                                    </td>
                                    <td className="py-3 px-4">
                                       <div className="text-slate-600">
                                          {staffer.title}
                                       </div>
                                    </td>
                                    <td className="py-3 px-4">
                                       <div className="text-slate-600 text-sm">
                                          {staffer.time_zone || "—"}
                                       </div>
                                    </td>
                                    <td className="py-3 px-4">
                                       <span
                                          className={`inline-block px-2 py-1 rounded-md text-sm font-medium ${getCapacityColor(
                                             staffer.capacity
                                          )}`}
                                       >
                                          {formatCapacity(staffer.capacity)}
                                       </span>
                                    </td>
                                    <td className="py-3 px-4">
                                       <div className="flex justify-end space-x-2">
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditStaffer(staffer);
                                             }}
                                          >
                                             Edit
                                          </Button>
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteStaffer(staffer);
                                             }}
                                             disabled={
                                                deleteLoading === staffer.id
                                             }
                                             className="text-red-600 border-red-300 hover:bg-red-50"
                                          >
                                             {deleteLoading === staffer.id
                                                ? "Deleting..."
                                                : "Delete"}
                                          </Button>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </CardContent>
            </Card>

            {/* Modal */}
            <StafferModal
               isOpen={isModalOpen}
               onClose={() => setIsModalOpen(false)}
               staffer={selectedStaffer}
               onSuccess={handleModalSuccess}
            />
         </div>
      </div>
   );
}
