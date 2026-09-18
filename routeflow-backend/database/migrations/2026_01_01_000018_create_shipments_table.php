<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->string('shipment_number');
            $table->foreignId('origin_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->string('destination_address');
            $table->string('destination_city')->nullable();
            $table->unsignedInteger('package_count')->default(1);
            $table->decimal('total_weight', 10, 2)->nullable();
            $table->string('priority')->default('standard');
            $table->string('status')->default('pending');
            $table->timestamp('expected_delivery_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['organization_id', 'shipment_number']);
            $table->index('organization_id');
            $table->index('order_id');
            $table->index(['organization_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
