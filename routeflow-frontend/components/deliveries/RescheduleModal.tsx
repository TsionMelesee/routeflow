"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Modal, Button, ErrorBanner, Input } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import { useRescheduleDelivery } from "@/hooks/use-deliveries";

const schema = z.object({
  scheduled_at: z.string().min(1, "Choose a new date and time"),
});
type FormValues = z.infer<typeof schema>;

export function RescheduleModal({ deliveryId, open, onClose }: { deliveryId: number; open: boolean; onClose: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const reschedule = useRescheduleDelivery(deliveryId);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await reschedule.mutateAsync(new Date(values.scheduled_at).toISOString());
      toast.success("Delivery rescheduled.");
      reset();
      onClose();
    } catch (error) {
      const message = applyApiErrorsToForm(error, setError);
      if (message) setFormError(message);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Reschedule delivery"
      description="Only available for a failed delivery."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            Reschedule
          </Button>
        </>
      }
    >
      <form onSubmit={(e) => e.preventDefault()}>
        <ErrorBanner error={formError} />
        <Input label="New scheduled time" type="datetime-local" required error={errors.scheduled_at?.message} {...register("scheduled_at")} className="mt-2" />
      </form>
    </Modal>
  );
}
