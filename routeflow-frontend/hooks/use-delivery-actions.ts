import { useState } from "react";

/** Centralizes the open/closed state for the five delivery action modals. */
export function useDeliveryModals() {
  const [assignOpen, setAssignOpen] = useState(false);
  const [failureOpen, setFailureOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [proofOpen, setProofOpen] = useState(false);

  return {
    assignOpen,
    setAssignOpen,
    failureOpen,
    setFailureOpen,
    rescheduleOpen,
    setRescheduleOpen,
    proofOpen,
    setProofOpen,
  };
}
