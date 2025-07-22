export function TimeOffLoadingState() {
   return (
      <div className="flex items-center justify-center py-8">
         <div className="flex items-center gap-2 text-slate-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></div>
            Loading time off entries...
         </div>
      </div>
   );
}
