// components/ui/BrandButton.jsx
import { Loader2 } from "lucide-react";

export default function BrandButton({ loading, children, onClick, disabled, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`relative flex items-center justify-center transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
          <Loader2 className="text-white animate-spin" size={20} />
        </div>
      )}
      <span className={loading ? "opacity-0" : "opacity-100"}>{children}</span>
    </button>
  );
}