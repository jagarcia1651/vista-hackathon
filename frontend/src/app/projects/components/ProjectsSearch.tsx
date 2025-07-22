import { SearchBar } from "@/components/shared/SearchBar";

interface ProjectsSearchProps {
   searchQuery: string;
   onSearch: (query: string) => void;
}

export function ProjectsSearch({ searchQuery, onSearch }: ProjectsSearchProps) {
   return (
      <SearchBar
         searchQuery={searchQuery}
         onSearch={onSearch}
         entityType="Projects"
         searchByDescription="project name or status"
         placeholder="Search projects..."
      />
   );
}
