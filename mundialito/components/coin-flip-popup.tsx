import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface CoinFlipPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onResult: (won: boolean) => void
}

export function CoinFlipPopup({ isOpen, onOpenChange, onResult }: CoinFlipPopupProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onResult, 3000); // Increased to 3s to match animation
      return () => clearTimeout(timer);
    }
  }, [isOpen, onResult]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Coin Flip Result</DialogTitle>
          <DialogDescription>
            Flipping a coin to determine if you advance...
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center h-40">
          <div className={cn(
            "w-20 h-20 relative",
            "before:content-[''] before:absolute before:w-full before:h-full before:rounded-full",
            "before:bg-gradient-to-b before:from-yellow-400 before:to-yellow-300",
            isOpen && "animate-[flip_3s_ease-out]"
          )}>
            {/* Coin sides */}
            <div className="absolute inset-0 rounded-full bg-yellow-400 flex items-center justify-center backface-hidden">
              H
            </div>
            <div className="absolute inset-0 rounded-full bg-yellow-300 flex items-center justify-center backface-hidden [transform:rotateY(180deg)]">
              T
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 