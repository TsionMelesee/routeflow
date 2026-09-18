<?php

namespace App\Enums;

enum StockMovementType: string
{
    case RECEIVED = 'received';
    case RESERVED = 'reserved';
    case RELEASED = 'released';
    case PICKED = 'picked';
    case TRANSFERRED_IN = 'transferred_in';
    case TRANSFERRED_OUT = 'transferred_out';
    case ADJUSTED = 'adjusted';

    public function affectsPhysicalQuantity(): bool
    {
        return in_array($this, [self::RECEIVED, self::PICKED, self::TRANSFERRED_IN, self::TRANSFERRED_OUT, self::ADJUSTED], true);
    }

    public function affectsReservedQuantity(): bool
    {
        return in_array($this, [self::RESERVED, self::RELEASED], true);
    }
}
