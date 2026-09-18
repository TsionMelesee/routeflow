"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Modal, Button, ErrorBanner, Input, Textarea } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import { useSubmitProofOfDelivery } from "@/hooks/use-deliveries";

const schema = z.object({
  recipient_name: z.string().min(1, "Recipient name is required").max(255),
  notes: z.string().max(1000).optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export function SubmitProofModal({ deliveryId, open, onClose }: { deliveryId: number; open: boolean; onClose: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const submitProof = useSubmitProofOfDelivery(deliveryId);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    const formData = new FormData();
    formData.append("recipient_name", values.recipient_name);
    if (values.notes) formData.append("notes", values.notes);
    if (signature) formData.append("signature", signature);
    if (photo) formData.append("photo", photo);

    try {
      await submitProof.mutateAsync(formData);
      toast.success("Delivery marked as delivered.");
      reset();
      setSignature(null);
      setPhoto(null);
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
      title="Submit proof of delivery"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            Mark as delivered
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <ErrorBanner error={formError} />
        <Input label="Recipient name" required error={errors.recipient_name?.message} {...register("recipient_name")} />

        <FileField label="Signature" file={signature} onChange={setSignature} />
        <FileField label="Photo" file={photo} onChange={setPhoto} />

        <Textarea label="Notes" error={errors.notes?.message} {...register("notes")} />
      </form>
    </Modal>
  );
}

function FileField({ label, file, onChange }: { label: string; file: File | null; onChange: (file: File | null) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      <label className="flex items-center gap-2 rounded-control border border-dashed border-border px-3 py-2.5 text-sm text-neutral cursor-pointer hover:border-brand-300 hover:bg-brand-50/50">
        <Upload className="h-4 w-4 shrink-0" />
        <span className="truncate">{file ? file.name : `Upload ${label.toLowerCase()} (optional)`}</span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}
