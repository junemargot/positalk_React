import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Transform.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faVolumeHigh, faXmark, faHistory } from '@fortawesome/free-solid-svg-icons';
import History from '../History/History';

function Transform({ histories, setHistories }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modelType, setModelType] = useState('openai-gpt');
  const [selectedModel, setSelectedModel] = useState('');
  const [showHistory, setShowHistory] = useState(false);  // 모달 표시 상태 추가

  useEffect(() => {
    setSelectedModel('');  // 초기에 "클라우드 AI" 표시
  }, []);

  // 모델별 스타일 옵션 정의 수정
  const styleOptions = {
    'openai-gpt': [
      { value: 'formal', label: '격식체' },
      { value: 'casual', label: '친근체' },
      { value: 'polite', label: '공손체' },
      { value: 'cute', label: '애교체' }
    ],
    'gemini': [
      { value: 'formal', label: '격식체' },
      { value: 'casual', label: '친근체' },
      { value: 'polite', label: '공손체' },
      { value: 'cute', label: '애교체' }
    ],
    'huggingface': [
      { value: 'formal', label: '격식체' },
      { value: 'casual', label: '친근체' },
      { value: 'polite', label: '공손체' },
      { value: 'cute', label: '애교체' }
    ]
  };

  // 모델 옵션 추가
  const modelOptions = [
    { value: 'openai-gpt', label: 'OpenAI GPT' },
    { value: 'gemini', label: 'Gemini' }
  ];

  // 변환하기 함수 추가
  const handleTransform = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: inputText,
        style: document.querySelector(`.${styles.styleSelect}`).value,
        model: modelType
      });
      
      const duration = Date.now() - startTime;
      const newHistory = {
        inputText,
        outputText: response.data.response,
        model: modelType,
        style: document.querySelector(`.${styles.styleSelect}`).value,
        timestamp: new Date().toLocaleString(),
        duration
      };
      
      setHistories(prev => [newHistory, ...prev]);
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
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopyMessage(true);
    setTimeout(() => setShowCopyMessage(false), 1000);
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

  // 히스토리 페이지로 이동하는 함수
  const handleHistoryClick = () => {
    navigate('/history');
  };

  // 음성 재생 함수 추가
  const handleSpeak = async (text, style) => {
    try {
      setIsPlaying(true);
      const response = await fetch('http://localhost:8000/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: { style }
        }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        window.URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error('Error:', error);
      setIsPlaying(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.transformBox}>
        <div className={styles.leftSection}>
          <div className={styles.headerSection}>
            <h3>원문</h3>
            <button 
              className={styles.historyButton}
              onClick={() => setShowHistory(true)}  // 모달 열기
            >
              <FontAwesomeIcon icon={faHistory} />
              <span>변환 기록</span>
            </button>
          </div>
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
          <button 
            className={styles.transformButton} 
            onClick={handleTransform} 
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? '변환 중..' : '변환하기'}
          </button>
        </div>
        <div className={styles.rightSection}>
        <div className={styles.selectWrapper}>
          
          <select className={styles.styleSelect} defaultValue="">
            <option value="" disabled>문체</option>
            {styleOptions[modelType].map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select 
            className={styles.styleSelect}
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>클라우드 AI</option>
            {modelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button 
            className={`${styles.modelButton} ${modelType === 'huggingface' ? styles.active : ''}`}
            onClick={() => setModelType('huggingface')}
          >
            polyglot-ko-5.8b
          </button>
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
            <button title="클립보드 복사" className={styles.copyButton} onClick={() => handleCopy(outputText)} disabled={!outputText}>
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
      {showHistory && (
        <History
          histories={histories}
          onSpeak={handleSpeak}
          onCopy={handleCopy}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

export default Transform;