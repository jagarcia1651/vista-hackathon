import { Input } from "@/components/ui/input";
import { useEditStaffers } from "../contexts/EditStaffersContext";

export function EditStafferRates() {
   const {
      currentRate,
      pendingRateData,
      rateLoading,
      handleRateChange,
      getCurrentRateValue,
   } = useEditStaffers();

   const handleCostRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0;
      handleRateChange("cost_rate", value);
   };

   const handleBillRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0;
      handleRateChange("bill_rate", value);
   };

   return (
      <div className="space-y-4">
         <h3 className="text-lg font-medium text-slate-900">Rates</h3>

         {rateLoading ? (
            <div className="text-sm text-slate-500">Loading rates...</div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label
                     htmlFor="cost_rate"
                     className="text-sm font-medium text-slate-900"
                  >
                     Cost Rate ($/hour)
                  </label>
                  <Input
                     id="cost_rate"
                     type="number"
                     step="0.01"
                     min="0"
                     value={getCurrentRateValue("cost_rate")}
                     onChange={handleCostRateChange}
                     placeholder="0.00"
                     className={
                        pendingRateData ? "border-amber-300 bg-amber-50" : ""
                     }
                  />
                  {pendingRateData && (
                     <div className="text-xs text-amber-600">
                        Rate will be {currentRate ? "updated" : "created"} when
                        you save
                     </div>
                  )}
               </div>

               <div className="space-y-2">
                  <label
                     htmlFor="bill_rate"
                     className="text-sm font-medium text-slate-900"
                  >
                     Bill Rate ($/hour)
                  </label>
                  <Input
                     id="bill_rate"
                     type="number"
                     step="0.01"
                     min="0"
                     value={getCurrentRateValue("bill_rate")}
                     onChange={handleBillRateChange}
                     placeholder="0.00"
                     className={
                        pendingRateData ? "border-amber-300 bg-amber-50" : ""
                     }
                  />
                  {pendingRateData && (
                     <div className="text-xs text-amber-600">
                        Rate will be {currentRate ? "updated" : "created"} when
                        you save
                     </div>
                  )}
               </div>
            </div>
         )}

         {currentRate && !pendingRateData && (
            <div className="text-xs text-slate-500">
               Current rates were last updated on{" "}
               {new Date(
                  currentRate.updated_at || currentRate.created_at
               ).toLocaleDateString()}
            </div>
         )}

         {!currentRate && !pendingRateData && !rateLoading && (
            <div className="text-sm text-slate-500 italic">
               No rates set yet. Enter values above to create rates for this
               staffer.
            </div>
         )}
      </div>
   );
}
