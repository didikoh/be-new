import styles from "./ConfirmationPopUp.module.css";

interface ConfirmationPopUpProps {
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const ConfirmationPopUp = ({
  message,
  onConfirm,
  onCancel,
}: ConfirmationPopUpProps) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            确认
          </button>
          <button className={styles.cancelBtn} onClick={onCancel}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopUp;
