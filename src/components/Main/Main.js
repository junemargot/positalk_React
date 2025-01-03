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
            세상에 따뜻함과<br/>
            긍정의 에너지를 더하다!
          </h2>
          <p>이쁜말 변환기는 AI 딥러닝 기술을 활용하여 일상에서 사용되는</p>
          <p>거친 표현이나 부정적인 문장을 긍정적인 말로 바꿔주는 서비스입니다.</p>
          {/* <button className={styles.experienceButton}>체험하러가기</button> */}
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
