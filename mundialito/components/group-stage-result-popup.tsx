import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface GroupStageResultPopupProps {
  isOpen: boolean
  onClose: () => void
  advanced: boolean
}

export function GroupStageResultPopup({ isOpen, onClose, advanced }: GroupStageResultPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Group Stage Results</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {advanced 
            ? "Congratulations! You've advanced to the knockout stage."
            : "Unfortunately, you didn't advance to the knockout stage."}
        </DialogDescription>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

