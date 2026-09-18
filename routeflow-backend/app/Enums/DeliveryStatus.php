<?php

namespace App\Enums;

enum DeliveryStatus: string
{
    case PENDING = 'pending';
    case ASSIGNED = 'assigned';
    case PICKED_UP = 'picked_up';
    case IN_TRANSIT = 'in_transit';
    case OUT_FOR_DELIVERY = 'out_for_delivery';
    case DELIVERED = 'delivered';
    case FAILED = 'failed';
    case RESCHEDULED = 'rescheduled';
    case RETURNED = 'returned';
    case CANCELLED = 'cancelled';

    /**
     * @return array<int, self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::PENDING => [self::ASSIGNED, self::CANCELLED],
            self::ASSIGNED => [self::PICKED_UP, self::CANCELLED],
            self::PICKED_UP => [self::IN_TRANSIT],
            self::IN_TRANSIT => [self::OUT_FOR_DELIVERY],
            self::OUT_FOR_DELIVERY => [self::DELIVERED, self::FAILED],
            self::FAILED => [self::RESCHEDULED, self::RETURNED],
            self::RESCHEDULED => [self::OUT_FOR_DELIVERY],
            self::DELIVERED, self::RETURNED, self::CANCELLED => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }

    public function isTerminal(): bool
    {
        return $this->allowedTransitions() === [];
    }

    public function isActive(): bool
    {
        return ! $this->isTerminal();
    }
}
