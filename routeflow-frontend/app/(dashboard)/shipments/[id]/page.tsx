"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Truck, Warehouse as WarehouseIcon, XCircle } from "lucide-react";
import { useCreateDeliveryFromShipment, useShipment, useUpdateShipmentStatus } from "@/hooks/use-shipments";
import { Breadcrumbs, Button, Card, CardBody, CardHeader, ConfirmDialog, ErrorState, LoadingState, StatusBadge } from "@/components/ui";
import { SHIPMENT_STATUS_TRANSITIONS, type ShipmentStatus } from "@/lib/types";
import { formatDateTime, formatNumber, titleCase } from "@/lib/utils";

// Manual status changes exclude IN_TRANSIT and DELIVERED — those are set
// automatically once a delivery is created and picked up (see
// UpdateDeliveryStatusAction in the backend), never by hand here.
const MANUAL_ONLY: ShipmentStatus[] = ["preparing", "ready_for_pickup", "cancelled"];

export default function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const shipmentId = Number(id);
  const router = useRouter();
  const { data: shipment, isLoading, error, refetch } = useShipment(shipmentId);
  const updateStatus = useUpdateShipmentStatus(shipmentId);
  const createDelivery = useCreateDeliveryFromShipment(shipmentId);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  if (isLoading) return <LoadingState label="Loading shipment…" />;
  if (error || !shipment) return <ErrorState error={error} onRetry={() => refetch()} />;

  const manualTargets = (SHIPMENT_STATUS_TRANSITIONS[shipment.status] ?? []).filter((s) => MANUAL_ONLY.includes(s));
  const advanceTarget = manualTargets.find((s) => s !== "cancelled");
  const canCancel = manualTargets.includes("cancelled");
  const canCreateDelivery = shipment.status === "ready_for_pickup" && !shipment.has_delivery;

  async function handleAdvance() {
    if (!advanceTarget) return;
    try {
      await updateStatus.mutateAsync(advanceTarget);
      toast.success(`Shipment marked as ${titleCase(advanceTarget)}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update shipment status.");
    }
  }

  async function handleCancel() {
    try {
      await updateStatus.mutateAsync("cancelled");
      toast.success("Shipment cancelled.");
      setConfirmCancelOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't cancel this shipment.");
      setConfirmCancelOpen(false);
    }
  }

  async function handleCreateDelivery() {
    try {
      const result = await createDelivery.mutateAsync(undefined);
      toast.success("Delivery created.");
      router.push(`/deliveries/${result.data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create a delivery for this shipment.");
    }
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Shipments", href: "/shipments" }, { label: shipment.shipment_number }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-ink">{shipment.shipment_number}</h1>
            <StatusBadge status={shipment.status} />
          </div>
          <Link href={`/orders/${shipment.order_id}`} className="text-sm text-brand hover:underline mt-0.5 inline-block">
            View order →
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {canCreateDelivery && (
            <Button icon={<Truck className="h-4 w-4" />} onClick={handleCreateDelivery} loading={createDelivery.isPending}>
              Create delivery
            </Button>
          )}
          {advanceTarget && (
            <Button variant="secondary" onClick={handleAdvance} loading={updateStatus.isPending}>
              Mark as {titleCase(advanceTarget)}
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" icon={<XCircle className="h-4 w-4" />} onClick={() => setConfirmCancelOpen(true)}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {shipment.has_delivery && (
        <div className="flex items-center gap-2 rounded-card border border-info/30 bg-info-bg px-4 py-3 text-sm text-info">
          <Truck className="h-4.5 w-4.5 shrink-0" />
          A delivery has been created for this shipment. Find it from the Deliveries list.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Items" />
          <div className="divide-y divide-border">
            {(shipment.items ?? []).map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-ink">{item.product_name ?? `Product #${item.product_id}`}</span>
                <span className="text-sm tabular-nums text-neutral">
                  {formatNumber(item.quantity)} {item.weight ? `· ${item.weight} kg` : ""}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Shipment details" />
            <CardBody className="space-y-3">
              <div className="flex items-start gap-2.5">
                <WarehouseIcon className="h-4 w-4 mt-0.5 text-neutral shrink-0" />
                <div>
                  <p className="text-xs text-neutral">Origin warehouse</p>
                  <p className="text-sm text-ink">{shipment.origin_warehouse?.name ?? "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral">Destination</p>
                <p className="text-sm text-ink">{[shipment.destination_address, shipment.destination_city].filter(Boolean).join(", ")}</p>
              </div>
              <div>
                <p className="text-xs text-neutral">Packages</p>
                <p className="text-sm text-ink">{formatNumber(shipment.package_count)}{shipment.total_weight ? ` · ${shipment.total_weight} kg total` : ""}</p>
              </div>
              <div>
                <p className="text-xs text-neutral">Expected delivery</p>
                <p className="text-sm text-ink">{formatDateTime(shipment.expected_delivery_at)}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel this shipment?"
        description={`This will cancel ${shipment.shipment_number}.`}
        confirmLabel="Cancel shipment"
        variant="danger"
        loading={updateStatus.isPending}
      />
    </div>
  );
}
