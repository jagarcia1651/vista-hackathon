import { ReactNode } from "react";

interface ModalProps {
   isOpen: boolean;
   onClose: () => void;
   children: ReactNode;
   maxWidth?: string; // e.g., "max-w-2xl", "max-w-md", "max-w-4xl"
   maxHeight?: string; // e.g., "max-h-[90vh]", "max-h-full"
   className?: string; // Additional styling for the modal container
   backdropClassName?: string; // Additional styling for the backdrop
   closeOnBackdropClick?: boolean; // Whether clicking backdrop closes modal
   preventScroll?: boolean; // Whether to prevent body scroll when modal is open
   stretch?: boolean; // Whether the modal should stretch to 90% width on larger screens
}

export function Modal({
   isOpen,
   onClose,
   children,
   maxWidth = "max-w-2xl",
   maxHeight = "max-h-[90vh]",
   className = "",
   backdropClassName = "",
   closeOnBackdropClick = true,
   preventScroll = true,
   stretch = false
}: ModalProps) {
   // Prevent body scroll when modal is open
   if (typeof document !== "undefined" && preventScroll) {
      if (isOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "unset";
      }
   }

   // Handle backdrop click
   const handleBackdropClick = () => {
      if (closeOnBackdropClick) {
         onClose();
      }
   };

   // Handle escape key
   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
         onClose();
      }
   };

   if (!isOpen) return null;

   const modalClasses = [
      "relative",
      "z-50",
      "w-full",
      stretch ? "w-[90vw]" : maxWidth,
      maxHeight,
      "overflow-y-auto",
      "overflow-x-hidden",
      className
   ]
      .filter(Boolean)
      .join(" ");

   return (
      <div
         className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden"
         onKeyDown={handleKeyDown}
         tabIndex={-1}
      >
         {/* Backdrop with blur */}
         <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${backdropClassName}`}
            onClick={handleBackdropClick}
         />

         {/* Modal Content */}
         <div className={modalClasses}>{children}</div>
      </div>
   );
}
