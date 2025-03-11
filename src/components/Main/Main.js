import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Main.module.css';
import mainImage from '../../images/positalk_speaker.png'

function Main() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <div className={styles.textContent}>
          <h2 className={styles.title}>
            말의 온도를 조절하는<br/>
            텍스트 변환의 새로운 경험
          </h2>
          <p>다양한 AI 모델을 활용해 원하는 문체로 변환해주는 텍스트 변환 서비스입니다.</p>
          <p>당신의 말에 적절한 온도를 더해보세요.</p>
          {/* <p>
            이쁜말 변환기는 AI 딥러닝 기술을 활용하여 일상에서 사용되는
            거친 표현이나 부정적인 문장을 긍정적인 말로 바꿔주는 서비스입니다.
          </p> */}
          <Link to="/transform" className={`${styles.experienceButton} ${styles.linkButton}`}>
            체험하러가기
          </Link>
        </div>
        <div className={styles.imageContent}>
          <img src={mainImage} alt='메인이미지' />
        </div>
      </div>
    </main>
  );
}

export default Main;
