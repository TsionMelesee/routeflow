<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use App\Policies\Concerns\ChecksOrganization;

class ProductPolicy
{
    use ChecksOrganization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('products.view');
    }

    public function view(User $user, Product $product): bool
    {
        return $user->hasPermission('products.view') && $this->sameOrganization($user, $product);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('products.create');
    }

    public function update(User $user, Product $product): bool
    {
        return $user->hasPermission('products.update') && $this->sameOrganization($user, $product);
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->hasPermission('products.delete') && $this->sameOrganization($user, $product);
    }
}
