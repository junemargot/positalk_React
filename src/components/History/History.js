import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faVolumeHigh, faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './History.module.css';

function History({ histories, onSpeak, onCopy, onClose }) {
  // 스타일 매핑
  const styleLabels = {
    formal: '격식체',
    casual: '친근체',
    polite: '공손체',
    cute: '애교체'
  };

  // 스타일별 클래스 매핑
  const styleClasses = {
    formal: styles.formalStyle,
    casual: styles.casualStyle,
    polite: styles.politeStyle,
    cute: styles.cuteStyle
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>변환 기록</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className={styles.historyList}>
          {histories.map((history, index) => (
            <div key={index} className={styles.historyItem}>
              <div className={styles.historyHeader}>
                <span className={styles.timestamp}>{history.timestamp}</span>
                <span className={styles.model}>{history.model}</span>
                <span className={`${styles.style} ${styleClasses[history.style]}`}>
                  {styleLabels[history.style]}
                </span>
                <span className={styles.duration}>{history.duration}ms</span>
              </div>
              <div className={styles.textContent}>
                <div className={styles.inputText}>
                  <label>원문:</label>
                  <p>{history.inputText}</p>
                </div>
                <div className={styles.outputText}>
                  <label>변환문:</label>
                  <p>{history.outputText}</p>
                </div>
              </div>
              <div className={styles.actions}>
                <button 
                  className={styles.actionButton} 
                  onClick={() => onSpeak(history.outputText, history.style)}
                >
                  <FontAwesomeIcon icon={faVolumeHigh} />
                </button>
                <button 
                  className={styles.actionButton} 
                  onClick={() => onCopy(history.outputText)}
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default History; 