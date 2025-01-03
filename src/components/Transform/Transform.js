import React, { useState } from 'react';
import axios from 'axios';  // axios import 추가
import styles from './Transform.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faVolumeHigh, faXmark } from '@fortawesome/free-solid-svg-icons';

function Transform() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');  // 출력 텍스트 상태 추가
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // 로딩 상태 추가
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai'); // 기본값을 'openai'로 설정

  // 변환하기 함수 추가
  const handleTransform = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: inputText,
        style: document.querySelector(`.${styles.styleSelect}`).value
      });
      
      setOutputText(response.data.response);
    } catch (error) {
      console.error('Error:', error);
      setOutputText('오류가 발생했습니다. 다시 시도해주세요.');
    }
    setIsLoading(false);
  };

  // text input area reset
  const handleReset = () => {
    setInputText('');
    setOutputText('');  // 출력도 초기화
  };

  // output text copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setShowCopyMessage(true);
      setTimeout(() => {
        setShowCopyMessage(false);
      }, 2000);
    } catch (err) {
      console.error('복사에 실패했습니다:', err);
    }
  };

  // handlePlaySound 함수 수정
  const handlePlaySound = async () => {
    if (!outputText || isPlaying) return;
    
    setIsPlaying(true);
    try {
      const selectedStyle = document.querySelector(`.${styles.styleSelect}`).value;
      const response = await axios.post('http://localhost:8000/api/tts', {
        text: outputText,
        voice: {
          style: selectedStyle  // 단순히 스타일 정보만 전달
        }
      }, {
        responseType: 'arraybuffer'
      });

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(response.data);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        setIsPlaying(false);
      };
      
      source.start(0);
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.transformBox}>
        <div className={styles.leftSection}>
          <h3>원문</h3>
          <div className={styles.inputWrapper}>
            <textarea 
              className={styles.inputArea} 
              placeholder="변환할 문장을 입력해주세요"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            {inputText && (
              <button className={styles.resetButton} onClick={handleReset}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>
          <button className={styles.transformButton} onClick={handleTransform} disabled={isLoading || !inputText.trim()}>
            {isLoading ? '변환 중..' : '변환하기'}
          </button>
        </div>
        <div className={styles.rightSection}>
        <div className={styles.selectWrapper}>
          <select className={styles.styleSelect}>
            <option value="formal">격식체</option>
            <option value="casual">친근체</option>
            <option value="polite">공손체</option>
            <option value="cute">애교체</option>
          </select>
          <div className={styles.modelButtons}>
            <button className={`${styles.modelButton} ${selectedModel === 'openai' ? styles.active : ''}`} onClick={() => setSelectedModel('openai')}>OpenAI</button>
            <button className={`${styles.modelButton} ${selectedModel === 'llm' ? styles.active : ''}`} onClick={() => setSelectedModel('llm')}>LLM</button>
          </div>
        </div>
        <textarea className={styles.outputArea} value={outputText} readOnly={true}></textarea>
        <div className={styles.buttonGroup}>
          <button title="사운드 재생" className={styles.soundButton} onClick={handlePlaySound} disabled={!outputText || isPlaying}>
            <FontAwesomeIcon icon={faVolumeHigh} />
            <span className={styles.srOnly}>
              {isPlaying ? '재생 중..' : '소리 재생'}
            </span>
          </button>
          <div className={styles.copyButtonWrapper}>
            <button title="클립보드 복사" className={styles.copyButton} onClick={handleCopy} disabled={!outputText}>
              <FontAwesomeIcon icon={faCopy} />
              <span className={styles.srOnly}>복사하기</span>
            </button>
            {showCopyMessage && (
              <div className={styles.copyMessage}>복사되었습니다</div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Transform;