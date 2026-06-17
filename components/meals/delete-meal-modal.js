"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import classes from "./delete-meal-modal.module.css";

export default function DeleteMealModal({
  open,
  title,
  isDeleting,
  onConfirm,
  onCancel,
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

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
            <h2 id="delete-meal-title">Delete meal?</h2>
            <p>
              Are you sure you want to delete <strong>{title}</strong>?
            </p>
            <div className={classes.actions}>
              <button type="button" onClick={onCancel} disabled={isDeleting}>
                No
              </button>
              <button type="button" onClick={onConfirm} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Yes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
