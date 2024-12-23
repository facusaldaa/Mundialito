import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface CoinFlipPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onResult: (won: boolean) => void
}

export function CoinFlipPopup({ isOpen, onOpenChange, onResult }: CoinFlipPopupProps) {
  const [result, setResult] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Determine result when opening
      const flipResult = Math.random() < 0.5;
      setResult(flipResult);
      const timer = setTimeout(() => {
        onResult(flipResult);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setResult(null); // Reset for next flip
    }
  }, [isOpen, onResult]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resultado del Flip</DialogTitle>
          <DialogDescription>
            Tirando una moneda para determinar si avanzas...
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center h-40">
          <div className={cn(
            "w-32 h-32 relative [perspective:1000px]",
            isOpen && result !== null && "animate-[spin_0.5s_linear_6]"
          )}>
            <div className={cn(
              "absolute inset-0 w-full h-full [transform-style:preserve-3d] transition-transform duration-[3000ms]",
              isOpen && result !== null && !result && "[transform:rotateY(180deg)]"
            )}>
              {/* Winning side */}
              <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-b from-yellow-400 to-yellow-500 flex items-center justify-center [backface-visibility:hidden] border-4 border-yellow-600">
              </div>
              {/* Losing side */}
              <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-b from-yellow-200 to-yellow-300 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] border-4 border-yellow-600">
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 