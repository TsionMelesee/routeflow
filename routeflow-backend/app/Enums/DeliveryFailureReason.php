<?php

namespace App\Enums;

enum DeliveryFailureReason: string
{
    case CUSTOMER_UNAVAILABLE = 'customer_unavailable';
    case WRONG_ADDRESS = 'wrong_address';
    case CUSTOMER_REFUSED = 'customer_refused';
    case DAMAGED_PACKAGE = 'damaged_package';
    case VEHICLE_PROBLEM = 'vehicle_problem';
    case OTHER = 'other';
}
