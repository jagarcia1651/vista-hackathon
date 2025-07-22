interface ErrorDisplayProps {
   error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
   if (!error) return null;

   return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
         {error}
      </div>
   );
}
