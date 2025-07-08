# Habitus33 AI-Link API 문서

## Execute AI-Link Workflow

AI-Link 워크플로우를 실행하는 메인 엔드포인트입니다.

-   **URL**: `/api/ai-link/execute`
-   **Method**: `POST`
-   **Auth required**: Yes (TODO: JWT Bearer Token)

### 요청 (Request)

**Header**

| Key             | Value                               | Description                  |
| --------------- | ----------------------------------- | ---------------------------- |
| `Content-Type`  | `application/json`                  |                              |
| `x-user-api-key`| `sk-...` 또는 `cl-...` 등           | 사용자가 제공한 AI 모델 API 키 |

**Body**

| Parameter     | Type     | Description                                | Required |
| ------------- | -------- | ------------------------------------------ | -------- |
| `userId`      | `string` | 요청을 보낸 사용자의 ID (ObjectId)           | Yes      |
| `aiLinkGoal`  | `string` | 사용자의 최종 목표 (예: "내 지식의 빈틈 찾기") | Yes      |
| `targetModel` | `string` | 사용할 AI 모델 (`'openai'` 또는 `'claude'`)  | Yes      |

### 응답 (Response)

**성공 (200 OK)**

```json
{
  "content": "AI가 생성한 최종 답변 텍스트입니다. 예를 들어, '회원님의 지식 중 양자 얽힘에 대한 부분이 부족해 보입니다.' 와 같은 내용이 담깁니다.",
  "citations": [
    {
      "sourceContent": "답변의 근거가 된 사용자의 메모 내용 원본입니다."
    }
  ]
}
```

**실패**

-   **400 Bad Request**: 필수 파라미터가 누락된 경우
-   **404 Not Found**: `userId`에 해당하는 사용자가 없는 경우
-   **500 Internal Server Error**: 서버 내부 오류 (DB, AI API 호출 실패 등)

### 호출 예제 (cURL)

```bash
curl -X POST http://localhost:8000/api/ai-link/execute \
-H "Content-Type: application/json" \
-H "x-user-api-key: YOUR_OPENAI_API_KEY" \
-d '{
    "userId": "60c72b2f9b1d8c001f8e4d1a",
    "aiLinkGoal": "내 메모들을 기반으로 블로그 글 초안을 작성해줘",
    "targetModel": "openai"
}'
``` 