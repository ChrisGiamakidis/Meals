"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import classes from "./delete-meal-modal.module.css";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export default function DeleteMealModal({
  open,
  title,
  action = "delete",
  entityLabel = "meal",
  isDeleting,
  onConfirm,
  onCancel,
}) {
  const isMounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!isMounted) {
    return null;
  }

  const actionLabel = action === "hide" ? "Hide" : "Delete";
  const pendingLabel = action === "hide" ? "Hiding..." : "Deleting...";

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={classes.backdrop}
          onClick={onCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={classes.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-meal-title"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <h2 id="delete-meal-title">
              {actionLabel} {entityLabel}?
            </h2>
            <p>
              Are you sure you want to {action} <strong>{title}</strong>?
            </p>
            <div className={classes.actions}>
              <button type="button" onClick={onCancel} disabled={isDeleting}>
                No
              </button>
              <button type="button" onClick={onConfirm} disabled={isDeleting}>
                {isDeleting ? pendingLabel : "Yes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
