import React from "react";
import styles from "../app/page.module.css";

export function FeuilleGauche({ animateOut }) {
  return (
    <div className={`${styles.feuillegauche} ${animateOut ? styles.out : ''}`}></div>
  );
}

export function FeuilleDroite({ animateOut }) {
  return (
    <div className={`${styles.feuilledroit} ${animateOut ? styles.out : ''}`}></div>
  );
}
