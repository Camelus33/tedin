# Zengo 데이터 관리 도구

MongoDB의 'zengo' 컬렉션에 저장된 속담/명언/명문장 데이터를 관리하기 위한 도구 모음입니다.

## 모든 도구 목록

| 스크립트 | 설명 | 실행 방법 |
|---------|-----|----------|
| `update-zengo-data.js` | 데이터 수정 (inconsistency 해결) | `npm run update-zengo-data` |
| `check-zengo-data.js` | 데이터 일관성 확인 | `npm run check-zengo-data` |
| `analyze-zengo-distribution.js` | 모드별 데이터 분포 분석 | `npm run analyze-zengo-distribution` |
| `insert-zengo-proverbs.js` | 신규 데이터 추가 | `npm run insert-zengo-proverbs <파일경로>` |
| `zengo-proverbs-template.js` | 데이터 템플릿 | 템플릿 복사 후 수정하여 사용 |

## 데이터 요구사항

- 각 언어(ko, en, zh, ja)별, 난이도(3x3-easy, 5x5-medium, 7x7-hard)별로 33개씩의 데이터가 필요합니다.
- 총 언어 4개 × 난이도 3개 × 33개 = 396개의 속담/명언/명문장이 필요합니다.

## 데이터 관리 워크플로우

### 1. 데이터 현황 분석

```bash
npm run analyze-zengo-distribution
```

이 명령은 각 모드별 데이터 수량과 부족한 데이터를 확인합니다.

### 2. 신규 데이터 추가

1. 템플릿 복사하여 데이터 파일 생성
    ```bash
    cp scripts/zengo-proverbs-template.js scripts/zengo-proverbs-en.js  # 예: 영어 데이터
    ```

2. 데이터 파일 편집
    - 교육적 가치가 높은 명언/속담으로 채웁니다.
    - 각 언어별, 난이도별 특성을 고려합니다.

3. 데이터 유효성 검증
    ```bash
    npm run validate-zengo-proverbs scripts/zengo-proverbs-en.js
    ```

4. 유효한 데이터 MongoDB에 추가
    ```bash
    npm run insert-zengo-proverbs scripts/zengo-proverbs-en.js
    ```

### 3. 데이터 일관성 확인

```bash
npm run check-zengo-data
```

### 4. 데이터 분포 재확인

```bash
npm run analyze-zengo-distribution
```

## 속담/명언/명문장 선정 가이드라인

### 교육적 가치

- **긍정적 메시지**: 동기 부여, 격려, 지혜를 주는 내용
- **보편적 가치**: 문화적 배경에 관계없이 이해될 수 있는 내용
- **다양한 주제**: 인내, 지혜, 용기, 정직, 겸손, 노력 등 다양한 가치 포함

### 난이도별 특성

- **3x3-easy**: 
  - 짧고 단순한 구조 (3-8 단어)
  - 직관적인 의미
  - 예: "Actions speak louder than words"

- **5x5-medium**:
  - 중간 길이 (5-12 단어)
  - 약간의 복잡성
  - 예: "The journey of a thousand miles begins with a single step"

- **7x7-hard**:
  - 긴 문장 (7-15 단어)
  - 심오한 의미
  - 예: "We must learn to live together as brothers or perish together as fools"

### 언어별 특성

각 언어권의 문화적 특성을 반영한 속담/명언을 선택하되, 보편적 교육 가치를 담고 있어야 합니다.

## 데이터 필드 설명

각 속담/명언 데이터는 다음 필드를 포함해야 합니다:

- `level`: 난이도 수준 ('3x3-easy', '5x5-medium', '7x7-hard')
- `language`: 언어 코드 ('ko', 'en', 'zh', 'ja')
- `boardSize`: 게임 보드 크기 (3, 5, 7 - level에 맞게)
- `proverbText`: 전체 속담/명언 텍스트
- `goPatternName`: 배치 패턴 이름 (선택 사항)
- `wordMappings`: 단어와 좌표 매핑 배열
- `totalWords`: 단어 수 (자동 계산됨)
- `totalAllowedStones`: 허용된 돌 수 (자동 계산됨)
- `initialDisplayTimeMs`: 초기 표시 시간(ms)
- `targetTimeMs`: 목표 완료 시간(ms) 