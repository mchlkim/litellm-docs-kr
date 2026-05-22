import React, { useState } from 'react';
import styles from './transform_request.module.css';

const DEFAULT_REQUEST = {
  "model": "bedrock/gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "당신은 도움이 되는 assistant입니다."
    },
    {
      "role": "user",
      "content": "양자 컴퓨팅을 쉽게 설명해 주세요"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500,
  "stream": true
};

type ViewMode = 'split' | 'request' | 'transformed';

const TransformRequestPlayground: React.FC = () => {
  const [request, setRequest] = useState(JSON.stringify(DEFAULT_REQUEST, null, 2));
  const [transformedRequest, setTransformedRequest] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  const handleTransform = async () => {
    try {
      // 실제 API 호출 대신 예시 응답을 표시합니다.
      const sampleResponse = `curl -X POST \\
  https://api.openai.com/v1/chat/completions \\
  -H 'Authorization: Bearer sk-xxx' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "당신은 도움이 되는 assistant입니다."
      }
    ],
    "temperature": 0.7
  }'`;
      setTransformedRequest(sampleResponse);
    } catch (error) {
      console.error('Error transforming request:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transformedRequest);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'request':
        return (
          <div className={styles.panel}>
            <div className={styles['panel-header']}>
              <h2>원본 요청</h2>
              <p>LiteLLM /chat/completions endpoint로 보낼 요청입니다.</p>
            </div>
            <textarea
              className={styles['code-input']}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              spellCheck={false}
            />
            <div className={styles['panel-footer']}>
              <button className={styles['transform-button']} onClick={handleTransform}>
                변환 →
              </button>
            </div>
          </div>
        );
      case 'transformed':
        return (
          <div className={styles.panel}>
            <div className={styles['panel-header']}>
              <h2>변환된 요청</h2>
              <p>LiteLLM이 지정 provider에 맞게 요청을 변환한 결과입니다.</p>
              <p className={styles.note}>참고: 민감한 header는 표시하지 않습니다.</p>
            </div>
            <div className={styles['code-output-container']}>
              <pre className={styles['code-output']}>{transformedRequest}</pre>
              <button className={styles['copy-button']} onClick={handleCopy}>
                복사
              </button>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className={styles.panel}>
              <div className={styles['panel-header']}>
                <h2>원본 요청</h2>
                <p>LiteLLM /chat/completions endpoint로 보낼 요청입니다.</p>
              </div>
              <textarea
                className={styles['code-input']}
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                spellCheck={false}
              />
              <div className={styles['panel-footer']}>
                <button className={styles['transform-button']} onClick={handleTransform}>
                  변환 →
                </button>
              </div>
            </div>
            <div className={styles.panel}>
              <div className={styles['panel-header']}>
                <h2>변환된 요청</h2>
                <p>LiteLLM이 지정 provider에 맞게 요청을 변환한 결과입니다.</p>
                <p className={styles.note}>참고: 민감한 header는 표시하지 않습니다.</p>
              </div>
              <div className={styles['code-output-container']}>
                <pre className={styles['code-output']}>{transformedRequest}</pre>
                <button className={styles['copy-button']} onClick={handleCopy}>
                  복사
                </button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className={styles['transform-playground']}>
      <div className={styles['view-toggle']}>
        <button
          className={viewMode === 'split' ? styles.active : ''}
          onClick={() => setViewMode('split')}
        >
          분할 보기
        </button>
        <button
          className={viewMode === 'request' ? styles.active : ''}
          onClick={() => setViewMode('request')}
        >
          요청
        </button>
        <button
          className={viewMode === 'transformed' ? styles.active : ''}
          onClick={() => setViewMode('transformed')}
        >
          변환 결과
        </button>
      </div>
      <div className={styles['playground-container']}>
        {renderContent()}
      </div>
    </div>
  );
};

export default TransformRequestPlayground; 
