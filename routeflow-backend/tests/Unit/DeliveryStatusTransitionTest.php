<?php

namespace Tests\Unit;

use App\Enums\DeliveryStatus;
use PHPUnit\Framework\TestCase;

class DeliveryStatusTransitionTest extends TestCase
{
    public function test_forward_transitions_are_allowed(): void
    {
        $this->assertTrue(DeliveryStatus::PENDING->canTransitionTo(DeliveryStatus::ASSIGNED));
        $this->assertTrue(DeliveryStatus::ASSIGNED->canTransitionTo(DeliveryStatus::PICKED_UP));
        $this->assertTrue(DeliveryStatus::OUT_FOR_DELIVERY->canTransitionTo(DeliveryStatus::DELIVERED));
    }

    public function test_backward_transitions_are_rejected(): void
    {
        $this->assertFalse(DeliveryStatus::DELIVERED->canTransitionTo(DeliveryStatus::IN_TRANSIT));
        $this->assertFalse(DeliveryStatus::IN_TRANSIT->canTransitionTo(DeliveryStatus::PENDING));
    }

    public function test_skipping_steps_is_rejected(): void
    {
        $this->assertFalse(DeliveryStatus::PENDING->canTransitionTo(DeliveryStatus::DELIVERED));
        $this->assertFalse(DeliveryStatus::ASSIGNED->canTransitionTo(DeliveryStatus::OUT_FOR_DELIVERY));
    }

    public function test_terminal_states_allow_nothing(): void
    {
        foreach ([DeliveryStatus::DELIVERED, DeliveryStatus::RETURNED, DeliveryStatus::CANCELLED] as $status) {
            $this->assertTrue($status->isTerminal());
            $this->assertSame([], $status->allowedTransitions());
        }
    }

    public function test_failed_delivery_can_be_rescheduled_or_returned(): void
    {
        $this->assertTrue(DeliveryStatus::FAILED->canTransitionTo(DeliveryStatus::RESCHEDULED));
        $this->assertTrue(DeliveryStatus::FAILED->canTransitionTo(DeliveryStatus::RETURNED));
        $this->assertTrue(DeliveryStatus::RESCHEDULED->canTransitionTo(DeliveryStatus::OUT_FOR_DELIVERY));
    }
}
