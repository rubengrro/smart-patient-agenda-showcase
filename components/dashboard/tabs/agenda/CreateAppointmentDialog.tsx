import CreateAppointmentForm from "@/components/forms/CreateAppointmentForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useState } from "react"

interface CreateAppointmentDialogProps {
  selectedDate: string
  disabled?: boolean
}

export function CreateAppointmentDialog({
  selectedDate,
  disabled = false,
}: CreateAppointmentDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} size="sm">
          <Plus className="mr-2 size-4" />
          New appointment
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0">
        <div className="border-b border-border/60 px-6 py-5">
          <DialogHeader>
            <DialogTitle>Create appointment</DialogTitle>
            <DialogDescription>
              Schedule a visit with availability, module and inventory validation.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          <CreateAppointmentForm
            selectedDate={selectedDate}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}