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
  const [modelType, setModelType] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [displayModel, setDisplayModel] = useState('');
  const [availableStyles, setAvailableStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('');

  useEffect(() => {
    setSelectedModel('');
  }, []);

  const allStyleOptions = [
    { value: 'formal', label: '격식체' },
    { value: 'casual', label: '친근체' },
    { value: 'polite', label: '공손체' },
    { value: 'cute', label: '애교체' }
  ];

  const modelOptions = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4o-mini', label: 'GPT-4 Mini' },
    { value: 'gemini', label: 'Gemini' }
  ];

  const localAIOptions = [
    { value: 'polyglot-ko', label: 'Polyglot-KO 5.8B' },
    { value: 'kogpt2', label: 'KoGPT2' },
    { value: 'qwen18b', label: 'Qwen1.5 1.8B' },
    { value: 'qwen15b', label: 'Qwen2.5 1.5B' },
    { value: 'qwen3b', label: 'Qwen2.5 3B' },
    { value: 'qwen7b', label: 'Qwen2.5 7B' },
    { value: 'bllossom', label: 'Llama Korean Bllossom 3B' },
    { value: 'heegyu', label: 'Heegyu Model' },
    { value: 'formal-9unu', label: 'Formal 9UNU' },
    { value: 'gentle-9unu', label: 'Gentle 9UNU' }
  ];

  const handleModelChange = (e) => {
    let newModel = e.target.value;
    
    // 9unu 모델들은 'h9'로 변경
    if (newModel === 'formal-9unu' || newModel === 'gentle-9unu') {
        newModel = 'h9';
    }
    
    setModelType(newModel);
    
    // 모델에 따른 스타일 옵션 설정
    if (newModel === 'heegyu') {
        setAvailableStyles(allStyleOptions.filter(style => 
            ['casual', 'cute'].includes(style.value)
        ));
        setSelectedStyle('casual'); // 기본값 설정
    } else if (e.target.value === 'gentle-9unu') {
        setAvailableStyles(allStyleOptions.filter(style => 
            style.value === 'polite'
        ));
        setSelectedStyle('polite'); // 기본값 설정
    } else if (e.target.value === 'formal-9unu') {
        setAvailableStyles(allStyleOptions.filter(style => 
            style.value === 'formal'
        ));
        setSelectedStyle('formal'); // 기본값 설정
    } else {
        setAvailableStyles(allStyleOptions);
    }
    
    const isCloudAI = modelOptions.some(opt => opt.value === e.target.value);
    const isLocalAI = localAIOptions.some(opt => opt.value === e.target.value);
    
    if (isCloudAI || isLocalAI) {
        setDisplayModel(modelOptions.find(opt => opt.value === e.target.value)?.label || 
                     localAIOptions.find(opt => opt.value === e.target.value)?.label || '');
    }
  };

  const handleTransform = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const requestData = {
        message: inputText,
        style: document.querySelector(`.${styles.styleSelect}`).value,
        model: modelType.startsWith('gpt') ? 'openai-gpt' : modelType,
        subModel: modelType.startsWith('gpt') ? modelType : undefined
      };
      console.log('요청 데이터:', requestData);

      const response = await axios.post('http://localhost:8000/api/chat', requestData);
      
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
      console.error('상세 에러:', error.response?.data);
      setOutputText('오류가 발생했습니다. 다시 시도해주세요.');
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setInputText('');
    setOutputText('');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopyMessage(true);
    setTimeout(() => setShowCopyMessage(false), 1000);
  };

  const handlePlaySound = async () => {
    if (!outputText || isPlaying) return;
    
    setIsPlaying(true);
    try {
      const selectedStyle = document.querySelector(`.${styles.styleSelect}`).value;
      const response = await axios.post('http://localhost:8000/api/tts', {
        text: outputText,
        voice: {
          style: selectedStyle
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

  const handleHistoryClick = () => {
    navigate('/history');
  };

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
              onClick={() => setShowHistory(true)}
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
          <select 
            className={styles.styleSelect} 
            defaultValue=""
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
          >
            <option value="" disabled>문체</option>
            {availableStyles.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <div className={styles.modelSelectWrapper}>
            <select 
              className={styles.styleSelect}
              value={modelOptions.some(opt => opt.value === modelType) ? modelType : ""}
              onChange={handleModelChange}
            >
              <option value="" disabled>클라우드 AI</option>
              {modelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select 
              className={styles.styleSelect}
              value={localAIOptions.some(opt => opt.value === modelType) ? modelType : ""}
              onChange={handleModelChange}
            >
              <option value="" disabled>로컬 AI</option>
              {localAIOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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