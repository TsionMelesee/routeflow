"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Modal, Button, ErrorBanner, Select, Textarea } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import { useReportDeliveryFailure } from "@/hooks/use-deliveries";

const schema = z.object({
  reason: z.enum(["customer_unavailable", "wrong_address", "customer_refused", "damaged_package", "vehicle_problem", "other"]),
  description: z.string().max(1000).optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

const REASON_OPTIONS = [
  { value: "customer_unavailable", label: "Customer unavailable" },
  { value: "wrong_address", label: "Wrong address" },
  { value: "customer_refused", label: "Customer refused" },
  { value: "damaged_package", label: "Damaged package" },
  { value: "vehicle_problem", label: "Vehicle problem" },
  { value: "other", label: "Other" },
];

export function ReportFailureModal({ deliveryId, open, onClose }: { deliveryId: number; open: boolean; onClose: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const reportFailure = useReportDeliveryFailure(deliveryId);

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
      await reportFailure.mutateAsync({ reason: values.reason, description: values.description || undefined });
      toast.success("Delivery failure recorded.");
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
      title="Report delivery failure"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            Report failure
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <ErrorBanner error={formError} />
        <Select label="Reason" required options={REASON_OPTIONS} placeholder="Select a reason" error={errors.reason?.message} {...register("reason")} />
        <Textarea label="Description" placeholder="What happened?" error={errors.description?.message} {...register("description")} />
      </form>
    </Modal>
  );
}
