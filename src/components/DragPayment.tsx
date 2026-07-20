import { useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { MONEY } from "../data/currency";
import { sounds } from "../audio/sound";

export interface PayResult {
  total: number;
  count: number;
  bills: string[];
  originRect: DOMRect | null;
}

interface DragPaymentProps {
  availableBills: string[];
  disabled?: boolean;
  confirmLabel?: string;
  onConfirm: (result: PayResult) => void;
  onTotalChange?: (total: number) => void;
}

interface DroppedBill {
  instanceId: number;
  id: string;
}

/**
 * The unified "drag real bills onto a payment tray" interaction. Tray bills
 * are reusable sources (drag as many as you like); each drop adds a bill to
 * the payment area. Tapping a dropped bill removes it. The running total is
 * shown live, and nothing is submitted until the child taps Confirm.
 *
 * Drop detection reuses the same getBoundingClientRect() point-in-rect check
 * that GameScreen already uses for the flying-star animation.
 */
export function DragPayment({
  availableBills,
  disabled,
  confirmLabel = "Pay! 💰",
  onConfirm,
  onTotalChange,
}: DragPaymentProps) {
  const dropRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const nextId = useRef(1);
  const [dropped, setDropped] = useState<DroppedBill[]>([]);

  const total = dropped.reduce((sum, b) => sum + MONEY[b.id].value, 0);

  function commit(next: DroppedBill[]) {
    setDropped(next);
    onTotalChange?.(next.reduce((sum, b) => sum + MONEY[b.id].value, 0));
  }

  function handleDragEnd(billId: string, info: PanInfo) {
    if (disabled) return;
    const zone = dropRef.current?.getBoundingClientRect();
    if (!zone) return;
    const { x, y } = info.point;
    const inside = x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
    if (inside) {
      commit([...dropped, { instanceId: nextId.current++, id: billId }]);
      sounds.click();
    }
  }

  function remove(instanceId: number) {
    if (disabled) return;
    sounds.click();
    commit(dropped.filter((b) => b.instanceId !== instanceId));
  }

  return (
    <div className="pay-area">
      <div className="payment-tray" ref={dropRef}>
        {dropped.length === 0 ? (
          <span className="pay-hint">Drag money here 👇</span>
        ) : (
          dropped.map((b) => (
            <motion.button
              key={b.instanceId}
              type="button"
              className="dropped-bill"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => remove(b.instanceId)}
              aria-label={`Remove ${MONEY[b.id].label}`}
              title="Tap to remove"
            >
              <img src={MONEY[b.id].image} alt="" />
            </motion.button>
          ))
        )}
      </div>

      <div className="pay-total" aria-live="polite">
        You have <strong>${total}</strong> so far
      </div>

      <div className="bill-tray">
        {availableBills.map((id) => (
          <motion.img
            key={id}
            className="tray-bill"
            src={MONEY[id].image}
            alt={MONEY[id].label}
            draggable={false}
            drag={!disabled}
            dragSnapToOrigin
            dragElastic={0.6}
            whileDrag={{ scale: 1.12, zIndex: 50 }}
            whileTap={{ scale: 1.05 }}
            onDragEnd={(_, info) => handleDragEnd(id, info)}
          />
        ))}
      </div>

      <motion.button
        ref={confirmRef}
        type="button"
        className="big-button confirm-button"
        disabled={disabled || dropped.length === 0}
        whileTap={{ scale: 0.95 }}
        onClick={() =>
          onConfirm({
            total,
            count: dropped.length,
            bills: dropped.map((b) => b.id),
            originRect: confirmRef.current?.getBoundingClientRect() ?? null,
          })
        }
      >
        {confirmLabel}
      </motion.button>
    </div>
  );
}
