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

interface SearchBarProps {
   searchQuery: string;
   onSearch: (query: string) => void;
   entityType: string; // e.g., "Staffers", "Projects", "Quotes"
   searchByDescription: string; // e.g., "name or email", "title or description"
   placeholder?: string; // Optional custom placeholder
   className?: string; // Optional additional styling
}

export function SearchBar({
   searchQuery,
   onSearch,
   entityType,
   searchByDescription,
   placeholder,
   className = "mb-6",
}: SearchBarProps) {
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

   const defaultPlaceholder =
      placeholder || `Search by ${searchByDescription}...`;

   return (
      <Card className={className}>
         <CardHeader>
            <CardTitle>Search {entityType}</CardTitle>
            <CardDescription>Search by {searchByDescription}</CardDescription>
         </CardHeader>
         <CardContent>
            <div className="flex gap-4">
               <div className="flex-1">
                  <Input
                     type="text"
                     placeholder={defaultPlaceholder}
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
