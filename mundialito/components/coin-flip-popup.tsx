import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

interface CoinFlipPopupProps {
  isOpen: boolean
  onClose: () => void
  onFlip: () => void
}

export function CoinFlipPopup({ isOpen, onClose, onFlip }: CoinFlipPopupProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onFlip(); // Automatically trigger the flip after a delay
      }, 2000); // 2 seconds delay for the flip animation

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [isOpen, onFlip]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Coin Flip</DialogTitle>
        </DialogHeader>
        <div className="text-center">
          <p>Flipping the coin...</p>
          {/* You can add an animation or image here */}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 