<?php

namespace App\Enums;

enum DriverStatus: string
{
    case AVAILABLE = 'available';
    case ON_DELIVERY = 'on_delivery';
    case OFF_DUTY = 'off_duty';
    case SUSPENDED = 'suspended';

    public function isAssignable(): bool
    {
        return $this === self::AVAILABLE;
    }
}
