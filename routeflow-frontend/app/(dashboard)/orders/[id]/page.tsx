"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, MapPin, PackagePlus, Truck, XCircle } from "lucide-react";
import { useCancelOrder, useCreateShipmentFromOrder, useOrder, useProcessOrder } from "@/hooks/use-orders";
import {
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  Drawer,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "@/components/ui";
import { CreateShipmentForm } from "@/components/shipments/CreateShipmentForm";
import type { CreateShipmentPayload } from "@/lib/api/orders";
import { formatCurrency, formatDateTime, formatNumber, titleCase } from "@/lib/utils";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const orderId = Number(id);
  const router = useRouter();
  const { data: order, isLoading, error, refetch } = useOrder(orderId);
  const processOrder = useProcessOrder(orderId);
  const cancelOrder = useCancelOrder(orderId);
  const createShipment = useCreateShipmentFromOrder(orderId);

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [shipmentDrawerOpen, setShipmentDrawerOpen] = useState(false);

  if (isLoading) return <LoadingState label="Loading order…" />;
  if (error || !order) return <ErrorState error={error} onRetry={() => refetch()} />;

  async function handleProcess() {
    try {
      await processOrder.mutateAsync();
      toast.success("Order is now processing.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't process this order.");
    }
  }

  async function handleCancel() {
    try {
      await cancelOrder.mutateAsync(undefined);
      toast.success("Order cancelled.");
      setConfirmCancelOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't cancel this order.");
      setConfirmCancelOpen(false);
    }
  }

  async function handleCreateShipment(payload: CreateShipmentPayload) {
    const result = await createShipment.mutateAsync(payload);
    toast.success("Shipment created.");
    setShipmentDrawerOpen(false);
    router.push(`/shipments/${result.data.id}`);
  }

  const itemsTotal = (order.items ?? []).reduce((sum, item) => sum + (item.unit_price ?? 0) * item.quantity, 0);
  const canProcess = order.status === "pending";
  const canCancel = order.status === "pending" || order.status === "processing";
  const canShip = order.status === "processing" && !order.has_shipment;

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Orders", href: "/orders" }, { label: order.order_number }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-ink">{order.order_number}</h1>
            <StatusBadge status={order.status} />
            {order.priority !== "standard" && (
              <span className={order.priority === "urgent" ? "text-xs font-semibold text-danger" : "text-xs font-medium text-info"}>
                {titleCase(order.priority)}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral mt-0.5">{order.customer?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {canProcess && (
            <Button variant="secondary" icon={<CheckCircle2 className="h-4 w-4" />} onClick={handleProcess} loading={processOrder.isPending}>
              Process order
            </Button>
          )}
          {canShip && (
            <Button icon={<PackagePlus className="h-4 w-4" />} onClick={() => setShipmentDrawerOpen(true)}>
              Create shipment
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" icon={<XCircle className="h-4 w-4" />} onClick={() => setConfirmCancelOpen(true)}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {order.has_shipment && (
        <div className="flex items-center gap-2 rounded-card border border-info/30 bg-info-bg px-4 py-3 text-sm text-info">
          <Truck className="h-4.5 w-4.5 shrink-0" />
          A shipment has been created for this order. Find it from the Shipments list.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Items" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-canvas/60 text-left text-xs text-neutral">
                  <th className="px-5 py-2.5">Product</th>
                  <th className="px-5 py-2.5 text-right">Qty</th>
                  <th className="px-5 py-2.5 text-right">Unit price</th>
                  <th className="px-5 py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(order.items ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-2.5">
                      <p className="font-medium text-ink">{item.product_name ?? `Product #${item.product_id}`}</p>
                      {item.sku && <p className="text-xs text-neutral font-mono">{item.sku}</p>}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{formatNumber(item.quantity)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{item.unit_price !== null ? formatCurrency(item.unit_price) : "—"}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums font-medium">
                      {item.unit_price !== null ? formatCurrency(item.unit_price * item.quantity) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              {itemsTotal > 0 && (
                <tfoot>
                  <tr className="border-t border-border">
                    <td colSpan={3} className="px-5 py-2.5 text-right text-sm font-medium text-neutral">
                      Total
                    </td>
                    <td className="px-5 py-2.5 text-right font-display font-semibold text-ink">{formatCurrency(itemsTotal)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Delivery" />
            <CardBody className="space-y-3">
              {order.pickup_address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 text-neutral shrink-0" />
                  <div>
                    <p className="text-xs text-neutral">Pickup</p>
                    <p className="text-sm text-ink">{[order.pickup_address, order.pickup_city].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-neutral shrink-0" />
                <div>
                  <p className="text-xs text-neutral">Delivery to</p>
                  <p className="text-sm text-ink">{[order.delivery_address, order.delivery_city].filter(Boolean).join(", ")}</p>
                </div>
              </div>
              {order.requested_at && (
                <div>
                  <p className="text-xs text-neutral">Requested for</p>
                  <p className="text-sm text-ink">{formatDateTime(order.requested_at)}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader title="Notes" />
              <CardBody>
                <p className="text-sm text-ink whitespace-pre-wrap">{order.notes}</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <Drawer open={shipmentDrawerOpen} onClose={() => setShipmentDrawerOpen(false)} title="Create shipment" description={`For order ${order.order_number}`}>
        <CreateShipmentForm order={order} onSubmit={handleCreateShipment} onCancel={() => setShipmentDrawerOpen(false)} />
      </Drawer>

      <ConfirmDialog
        open={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel this order?"
        description={`This will cancel ${order.order_number}.`}
        confirmLabel="Cancel order"
        variant="danger"
        loading={cancelOrder.isPending}
      />
    </div>
  );
}
