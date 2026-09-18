<?php

namespace App\Enums;

enum OrderPriority: string
{
    case STANDARD = 'standard';
    case EXPRESS = 'express';
    case URGENT = 'urgent';
}
