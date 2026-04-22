import { ReactNode, useEffect, useRef } from "react";
import { CgClose } from "react-icons/cg";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import styles from "./PopupMessage.module.css";
import { ToastType } from "../stores/useUIStore";

interface PopupMessageProps {
  message?: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const icons: Record<ToastType, ReactNode> = {
  success: <FaCheckCircle />,
  error: <FaTimesCircle />,
  warning: <FaExclamationTriangle />,
  info: <FaInfoCircle />,
};

const PopupMessage = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: PopupMessageProps) => {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.icon}>{icons[type]}</span>
      <span className={styles.message}>{message ?? ""}</span>
      <button className={styles.closeButton} onClick={onClose}>
        <CgClose />
      </button>
    </div>
  );
};

export default PopupMessage;
