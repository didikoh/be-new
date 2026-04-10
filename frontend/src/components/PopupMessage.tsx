import { CgClose } from "react-icons/cg";
import styles from "./PopupMessage.module.css";
import { useAppContext } from "../contexts/AppContext";

const PopupMessage = () => {
  const { promptMessage, setPromptMessage } = useAppContext();

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <button className={styles.closeButton} onClick={setPromptMessage("")}>
          <CgClose />
        </button>
        <div className={styles.message}>{promptMessage}</div>
      </div>
    </div>
  );
};

export default PopupMessage;
