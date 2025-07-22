import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCallback } from "react";

interface StaffersSearchProps {
   searchQuery: string;
   onSearch: (query: string) => void;
}

export function StaffersSearch({ searchQuery, onSearch }: StaffersSearchProps) {
   // Debounced search to prevent excessive filtering
   const handleSearchChange = useCallback(
      (value: string) => {
         onSearch(value);
      },
      [onSearch]
   );

   const handleClearSearch = useCallback(() => {
      onSearch("");
   }, [onSearch]);

   return (
      <Card className="mb-6">
         <CardHeader>
            <CardTitle>Search Staffers</CardTitle>
            <CardDescription>Search by name or email address</CardDescription>
         </CardHeader>
         <CardContent>
            <div className="flex gap-4">
               <div className="flex-1">
                  <Input
                     type="text"
                     placeholder="Search by name or email..."
                     value={searchQuery}
                     onChange={(e) => handleSearchChange(e.target.value)}
                  />
               </div>
               {searchQuery && (
                  <Button variant="outline" onClick={handleClearSearch}>
                     Clear Search
                  </Button>
               )}
            </div>
         </CardContent>
      </Card>
   );
}
