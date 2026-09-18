"use client";

import { use } from "react";
import { toast } from "sonner";
import { AlertTriangle, Camera, Car, RotateCcw, ShieldAlert, UserCog, UserPlus } from "lucide-react";
import { useDelivery, useUpdateDeliveryStatus } from "@/hooks/use-deliveries";
import { useDeliveryModals } from "@/hooks/use-delivery-actions";
import { useAuth } from "@/providers/auth-provider";
import { can } from "@/lib/auth/permissions";
import {
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  LoadingState,
  StatusBadge,
  Timeline,
} from "@/components/ui";
import { AssignDeliveryModal } from "@/components/deliveries/AssignDeliveryModal";
import { ReportFailureModal } from "@/components/deliveries/ReportFailureModal";
import { RescheduleModal } from "@/components/deliveries/RescheduleModal";
import { SubmitProofModal } from "@/components/deliveries/SubmitProofModal";
import { formatDateTime, titleCase } from "@/lib/utils";
import type { DeliveryStatus } from "@/lib/types";

// Forward transitions with no extra data to collect — just a status
// change. Anything needing more (assign, failure reason, proof,
// reschedule date) goes through its own modal instead.
const SIMPLE_NEXT_STATUS: Partial<Record<DeliveryStatus, { target: DeliveryStatus; label: string }>> = {
  assigned: { target: "picked_up", label: "Mark picked up" },
  picked_up: { target: "in_transit", label: "Mark in transit" },
  in_transit: { target: "out_for_delivery", label: "Mark out for delivery" },
  failed: { target: "returned", label: "Mark returned to warehouse" },
  rescheduled: { target: "out_for_delivery", label: "Mark out for delivery" },
};

export default function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const deliveryId = Number(id);
  const { user } = useAuth();
  const { data: delivery, isLoading, error, refetch } = useDelivery(deliveryId);
  const updateStatus = useUpdateDeliveryStatus(deliveryId);
  const modals = useDeliveryModals();

  if (isLoading) return <LoadingState label="Loading delivery…" />;
  if (error || !delivery) return <ErrorState error={error} onRetry={() => refetch()} />;

  // Hides action buttons for roles that have no delivery abilities at
  // all (e.g. warehouse-staff). A driver only owns their own assigned
  // delivery — the API doesn't expose enough on /auth/me to check that
  // client-side, so drivers see the buttons and the backend's ownership
  // check (DeliveryPolicy) is still the real gate; a driver acting on
  // someone else's delivery gets a real 403, surfaced as a toast below.
  const canAct = can(user, "dispatcher", "driver");

  const simpleNext = SIMPLE_NEXT_STATUS[delivery.status];
  const isTerminal = ["delivered", "returned", "cancelled"].includes(delivery.status);
  const canAssign = delivery.status === "pending" || delivery.status === "assigned";
  const canCancel = delivery.status === "pending" || delivery.status === "assigned";
  const canReportOutcome = delivery.status === "out_for_delivery";

  async function handleSimpleAdvance() {
    if (!simpleNext) return;
    try {
      await updateStatus.mutateAsync({ status: simpleNext.target });
      toast.success(`Delivery marked as ${titleCase(simpleNext.target)}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update this delivery.");
    }
  }

  async function handleCancel() {
    try {
      await updateStatus.mutateAsync({ status: "cancelled" });
      toast.success("Delivery cancelled.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't cancel this delivery.");
    }
  }

  const timelineEntries = (delivery.history ?? []).map((h) => ({
    status: h.status,
    notes: h.notes,
    actor: h.changed_by,
    timestamp: h.created_at,
  }));

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Deliveries", href: "/deliveries" }, { label: delivery.delivery_number }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-ink">{delivery.delivery_number}</h1>
            <StatusBadge status={delivery.status} />
          </div>
          <p className="text-sm text-neutral mt-0.5">Scheduled {formatDateTime(delivery.scheduled_at)}</p>
        </div>
        {canAct && !isTerminal && (
          <div className="flex flex-wrap items-center gap-2">
            {canAssign && (
              <Button variant="secondary" icon={<UserPlus className="h-4 w-4" />} onClick={() => modals.setAssignOpen(true)}>
                {delivery.driver ? "Reassign" : "Assign"}
              </Button>
            )}
            {simpleNext && (
              <Button onClick={handleSimpleAdvance} loading={updateStatus.isPending}>
                {simpleNext.label}
              </Button>
            )}
            {canReportOutcome && (
              <>
                <Button icon={<Camera className="h-4 w-4" />} onClick={() => modals.setProofOpen(true)}>
                  Submit proof
                </Button>
                <Button variant="outline" icon={<AlertTriangle className="h-4 w-4" />} onClick={() => modals.setFailureOpen(true)}>
                  Report failure
                </Button>
              </>
            )}
            {delivery.status === "failed" && (
              <Button variant="outline" icon={<RotateCcw className="h-4 w-4" />} onClick={() => modals.setRescheduleOpen(true)}>
                Reschedule
              </Button>
            )}
            {canCancel && (
              <Button variant="outline" onClick={handleCancel} loading={updateStatus.isPending}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>

      {delivery.failures && delivery.failures.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-card border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          <ShieldAlert className="h-4.5 w-4.5 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">{titleCase(delivery.failures[0].reason)}</p>
            {delivery.failures[0].description && <p className="mt-0.5">{delivery.failures[0].description}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader title="Assignment" />
            <CardBody className="space-y-3">
              <div className="flex items-start gap-2.5">
                <UserCog className="h-4 w-4 mt-0.5 text-neutral shrink-0" />
                <div>
                  <p className="text-xs text-neutral">Driver</p>
                  <p className="text-sm text-ink">{delivery.driver?.name ?? "Unassigned"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Car className="h-4 w-4 mt-0.5 text-neutral shrink-0" />
                <div>
                  <p className="text-xs text-neutral">Vehicle</p>
                  <p className="text-sm text-ink">{delivery.vehicle?.plate_number ?? "Unassigned"}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {delivery.proof_of_delivery && (
            <Card>
              <CardHeader title="Proof of delivery" />
              <CardBody className="space-y-3">
                <div>
                  <p className="text-xs text-neutral">Received by</p>
                  <p className="text-sm text-ink">{delivery.proof_of_delivery.recipient_name}</p>
                </div>
                {delivery.proof_of_delivery.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={delivery.proof_of_delivery.photo_url} alt="Delivery proof" className="rounded-control border border-border" />
                )}
                {delivery.proof_of_delivery.signature_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={delivery.proof_of_delivery.signature_url} alt="Recipient signature" className="rounded-control border border-border bg-canvas" />
                )}
                {delivery.proof_of_delivery.notes && <p className="text-sm text-ink">{delivery.proof_of_delivery.notes}</p>}
              </CardBody>
            </Card>
          )}

          {delivery.notes && (
            <Card>
              <CardHeader title="Notes" />
              <CardBody>
                <p className="text-sm text-ink whitespace-pre-wrap">{delivery.notes}</p>
              </CardBody>
            </Card>
          )}
        </div>

        <Card className="lg:col-span-2">
          <CardHeader title="Status history" />
          <CardBody>
            <Timeline entries={timelineEntries} />
          </CardBody>
        </Card>
      </div>

      <AssignDeliveryModal deliveryId={deliveryId} open={modals.assignOpen} onClose={() => modals.setAssignOpen(false)} />
      <ReportFailureModal deliveryId={deliveryId} open={modals.failureOpen} onClose={() => modals.setFailureOpen(false)} />
      <RescheduleModal deliveryId={deliveryId} open={modals.rescheduleOpen} onClose={() => modals.setRescheduleOpen(false)} />
      <SubmitProofModal deliveryId={deliveryId} open={modals.proofOpen} onClose={() => modals.setProofOpen(false)} />
    </div>
  );
}
