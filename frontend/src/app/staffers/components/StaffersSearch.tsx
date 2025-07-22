import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface StaffersSearchProps {
   searchQuery: string;
   onSearch: (query: string) => void;
}

export function StaffersSearch({ searchQuery, onSearch }: StaffersSearchProps) {
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
                     onChange={(e) => onSearch(e.target.value)}
                  />
               </div>
               {searchQuery && (
                  <Button variant="outline" onClick={() => onSearch("")}>
                     Clear Search
                  </Button>
               )}
            </div>
         </CardContent>
      </Card>
   );
}
