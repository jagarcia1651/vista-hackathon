import { Input } from "@/components/ui/input";
import { useEditStaffers } from "../contexts/EditStaffersContext";
import { useStaffers } from "../contexts/StaffersContext";

export function EditStafferDetails() {
   const { formData, handleInputChange } = useEditStaffers();
   const { seniorities } = useStaffers();

   return (
      <div className="space-y-4">
         <h3 className="text-lg font-medium text-slate-900">
            Basic Information
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
               <label
                  htmlFor="first_name"
                  className="text-sm font-medium text-slate-900"
               >
                  First Name
               </label>
               <Input
                  id="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                     handleInputChange("first_name", e.target.value)
                  }
                  placeholder="John"
                  required
               />
            </div>

            <div className="space-y-2">
               <label
                  htmlFor="last_name"
                  className="text-sm font-medium text-slate-900"
               >
                  Last Name
               </label>
               <Input
                  id="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                     handleInputChange("last_name", e.target.value)
                  }
                  placeholder="Doe"
                  required
               />
            </div>
         </div>

         <div className="space-y-2">
            <label
               htmlFor="email"
               className="text-sm font-medium text-slate-900"
            >
               Email Address
            </label>
            <Input
               id="email"
               type="email"
               value={formData.email}
               onChange={(e) => handleInputChange("email", e.target.value)}
               placeholder="john.doe@company.com"
               required
            />
         </div>

         <div className="space-y-2">
            <label
               htmlFor="title"
               className="text-sm font-medium text-slate-900"
            >
               Job Title
            </label>
            <Input
               id="title"
               type="text"
               value={formData.title}
               onChange={(e) => handleInputChange("title", e.target.value)}
               placeholder="Software Engineer"
               required
            />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
               <label
                  htmlFor="time_zone"
                  className="text-sm font-medium text-slate-900"
               >
                  Time Zone{" "}
                  <span className="text-slate-500 font-normal">(optional)</span>
               </label>
               <Input
                  id="time_zone"
                  type="text"
                  value={formData.time_zone || ""}
                  onChange={(e) =>
                     handleInputChange("time_zone", e.target.value)
                  }
                  placeholder="America/New_York"
               />
            </div>

            <div className="space-y-2">
               <label
                  htmlFor="seniority_id"
                  className="text-sm font-medium text-slate-900"
               >
                  Seniority Level{" "}
                  <span className="text-slate-500 font-normal">(optional)</span>
               </label>
               {seniorities.length === 0 ? (
                  <div className="text-sm text-slate-500">
                     Loading seniorities...
                  </div>
               ) : (
                  <select
                     id="seniority_id"
                     value={formData.seniority_id || ""}
                     onChange={(e) =>
                        handleInputChange("seniority_id", e.target.value)
                     }
                     className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="">Select seniority level</option>
                     {seniorities.map((seniority) => (
                        <option
                           key={seniority.seniority_id}
                           value={seniority.seniority_id}
                        >
                           {seniority.seniority_name}
                        </option>
                     ))}
                  </select>
               )}
            </div>
         </div>

         <div className="space-y-2">
            <label
               htmlFor="capacity"
               className="text-sm font-medium text-slate-900"
            >
               Weekly Capacity (hours)
            </label>
            <Input
               id="capacity"
               type="number"
               step="0.5"
               min="0"
               max="168"
               value={formData.capacity}
               onChange={(e) =>
                  handleInputChange("capacity", parseFloat(e.target.value) || 0)
               }
               placeholder="40"
               required
            />
            <div className="text-xs text-slate-500">
               Enter weekly working hours (e.g., 40 for full-time, 20 for
               part-time)
            </div>
         </div>
      </div>
   );
}
