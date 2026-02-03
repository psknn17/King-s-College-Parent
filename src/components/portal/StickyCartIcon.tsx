import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface StickyCartIconProps {
  itemCount: number;
  onClick: () => void;
}

export const StickyCartIcon = ({ itemCount, onClick }: StickyCartIconProps) => {
  const isMobile = useIsMobile();
  
  // On mobile, position above the bottom nav (bottom-20 instead of bottom-6)
  const bottomPosition = isMobile ? "bottom-20" : "bottom-6";
  const isEmpty = itemCount === 0;

  return (
    <div className={`fixed ${bottomPosition} right-4 z-50 animate-scale-in`}>
      <Button
        onClick={onClick}
        size="lg"
        className={`relative rounded-full h-14 w-14 md:h-16 md:w-16 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
          isEmpty 
            ? "bg-muted text-muted-foreground opacity-70 hover:opacity-100 hover:bg-primary hover:text-primary-foreground" 
            : "bg-primary hover:bg-primary/90"
        } ${!isMobile && !isEmpty ? "animate-pulse hover:animate-none" : ""}`}
      >
        <ShoppingCart className="h-6 w-6 md:h-7 md:w-7" />
        {itemCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-6 w-6 md:h-7 md:w-7 flex items-center justify-center p-0 text-xs md:text-sm font-bold animate-bounce"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};