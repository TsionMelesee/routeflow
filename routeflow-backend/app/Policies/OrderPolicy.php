<?php

namespace App\Policies;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use App\Policies\Concerns\ChecksOrganization;

class OrderPolicy
{
    use ChecksOrganization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('orders.view');
    }

    public function view(User $user, Order $order): bool
    {
        return $user->hasPermission('orders.view') && $this->sameOrganization($user, $order);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('orders.create');
    }

    public function update(User $user, Order $order): bool
    {
        return $user->hasPermission('orders.update')
            && $this->sameOrganization($user, $order)
            && ! $order->status->isTerminal();
    }

    public function process(User $user, Order $order): bool
    {
        return $user->hasPermission('orders.update')
            && $this->sameOrganization($user, $order)
            && $order->status->canTransitionTo(OrderStatus::PROCESSING);
    }

    public function cancel(User $user, Order $order): bool
    {
        return $user->hasPermission('orders.cancel')
            && $this->sameOrganization($user, $order)
            && $order->status->canTransitionTo(OrderStatus::CANCELLED);
    }
}
