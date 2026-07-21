import { useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import type { ShopItem } from "../types";
import { sounds } from "../audio/sound";
import type { PayResult } from "./DragPayment";

interface DragBudgetProps {
  shopItems: ShopItem[];
  budget: number;
  buyCount: number;
  disabled?: boolean;
  onConfirm: (result: PayResult) => void;
}

/**
 * Budgeting interaction: drag items from the shelf into the cart, keeping the
 * total within the budget. Each item can be added once (tap in the cart to
 * remove). Nothing is submitted until the child taps "Check out".
 *
 * onConfirm reports { total, count } via PayResult so GameScreen can score it
 * (count === buyCount && total <= budget). `bills` is unused here.
 */
export function DragBudget({ shopItems, budget, buyCount, disabled, onConfirm }: DragBudgetProps) {
  const dropRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [cart, setCart] = useState<string[]>([]); // shop item ids

  const total = cart.reduce((sum, id) => sum + (shopItems.find((s) => s.id === id)?.price ?? 0), 0);
  const overBudget = total > budget;

  function handleDragEnd(itemId: string, info: PanInfo) {
    if (disabled) return;
    const zone = dropRef.current?.getBoundingClientRect();
    if (!zone) return;
    const { x, y } = info.point;
    const inside = x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
    if (inside && !cart.includes(itemId)) {
      setCart((c) => [...c, itemId]);
      sounds.click();
    }
  }

  function remove(itemId: string) {
    if (disabled) return;
    sounds.click();
    setCart((c) => c.filter((id) => id !== itemId));
  }

  return (
    <div className="pay-area">
      <div className="budget-bar">
        <span className="budget-chip">Budget: <strong>${budget}</strong></span>
        <span className={`cart-chip ${overBudget ? "over" : ""}`}>
          Cart: <strong>${total}</strong>
        </span>
        <span className="pick-count">{cart.length}/{buyCount} picked</span>
      </div>

      <div className={`payment-tray cart-tray ${overBudget ? "over" : ""}`} ref={dropRef}>
        {cart.length === 0 ? (
          <span className="pay-hint">Drag items into your cart 🛒</span>
        ) : (
          cart.map((id) => {
            const it = shopItems.find((s) => s.id === id);
            if (!it) return null;
            return (
              <motion.button
                key={id}
                type="button"
                className="cart-item"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => remove(id)}
                aria-label={`Remove ${it.name}`}
                title="Tap to remove"
              >
                <span className="cart-item-emoji">{it.emoji}</span>
                <span className="cart-item-price">${it.price}</span>
              </motion.button>
            );
          })
        )}
      </div>
      {cart.length > 0 && <p className="pay-tip">Tap an item to take it out 👆</p>}

      <div className="shop-shelf-row">
        {shopItems.map((it) => {
          const inCart = cart.includes(it.id);
          return (
            <motion.div
              key={it.id}
              className={`shop-item ${inCart ? "in-cart" : ""}`}
              drag={!disabled && !inCart}
              dragSnapToOrigin
              dragElastic={0.6}
              whileDrag={{ scale: 1.1, zIndex: 50 }}
              whileTap={{ scale: 1.04 }}
              onDragEnd={(_, info) => handleDragEnd(it.id, info)}
            >
              <span className="shop-item-emoji">{it.emoji}</span>
              <span className="shop-item-name">{it.name}</span>
              <span className="shop-item-price">${it.price}</span>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        ref={confirmRef}
        type="button"
        className="big-button confirm-button"
        disabled={disabled || cart.length !== buyCount}
        whileTap={{ scale: 0.95 }}
        onClick={() =>
          onConfirm({
            total,
            count: cart.length,
            bills: [],
            originRect: confirmRef.current?.getBoundingClientRect() ?? null,
          })
        }
      >
        Check out 🛒
      </motion.button>
    </div>
  );
}
