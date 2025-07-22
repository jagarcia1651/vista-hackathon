import { SearchBar } from "@/components/shared/SearchBar";

interface StaffersSearchProps {
   searchQuery: string;
   onSearch: (query: string) => void;
}

export function StaffersSearch({ searchQuery, onSearch }: StaffersSearchProps) {
   return (
      <SearchBar
         searchQuery={searchQuery}
         onSearch={onSearch}
         entityType="Staffers"
         searchByDescription="name or email address"
         placeholder="Search by name or email..."
      />
   );
}
