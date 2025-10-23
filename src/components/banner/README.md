# 배너 컴포넌트 가이드

개선된 배너 시스템은 현대적이고 세련된 디자인과 애니메이션을 제공합니다.

## 📦 컴포넌트 구성

### 1. TelegramBanner

텔레그램 고객센터로 이동하는 배너입니다.

**주요 기능:**

- ✨ 펄스 애니메이션이 적용된 글로우 효과
- 🎯 호버 시 아이콘 바운스 애니메이션
- 🌈 그라데이션 배경 효과
- 📱 반응형 디자인
- 💫 페이드인 트랜지션

**사용 예시:**

```tsx
import TelegramBanner from "@components/TelegramBanner";

function MyPage() {
  return <TelegramBanner />;
}
```

**커스터마이징:**

- `href` 속성을 변경하여 다른 링크로 연결 가능
- 색상, 크기 등은 sx prop으로 오버라이드 가능

---

### 2. PopupBanner

팝업 형태의 배너로 여러 배너를 순서대로 표시합니다.

**주요 기능:**

- 📚 스택 방식으로 배너 순서대로 표시
- ⌨️ 키보드 네비게이션 (ESC)
- 🖱️ 직관적인 UI (닫기 버튼)
- 📍 진행 상황 인디케이터 (1/3)
- 🎨 부드러운 애니메이션 효과
- 💾 "3일동안 보지 않기" 기능
- 📱 모바일 최적화 (전체 화면)
- 💻 PC 최적화 (중앙 정렬, 380x546px 고정)

**동작 방식:**

- 맨 앞 배너만 표시됩니다
- 현재 배너를 닫으면 다음 배너가 자동으로 표시됩니다
- 순서대로만 닫을 수 있습니다 (건너뛰기 불가)

**사용 예시:**

```tsx
import PopupBanner from "@components/banner/popupbanner";

function App({ banners }) {
  return <PopupBanner banner={banners} />;
}
```

**키보드 단축키:**

- `ESC` : 현재 배너 닫기

**Props:**

- `banner`: banner[] - 표시할 배너 배열 (순서대로 표시됨)

---

## 🎨 스타일 유틸리티 (`banner-styles.ts`)

재사용 가능한 스타일 정의를 제공합니다.

### 그라데이션 팔레트

```tsx
import { gradients } from "@components/banner/banner-styles";

// 사용 예시
<Box sx={{ background: gradients.primary }} />;
```

**사용 가능한 그라데이션:**

- `primary` / `primaryReverse`
- `secondary` / `secondaryReverse`
- `success`
- `warning`
- `info`
- `dark` / `darkHover`
- `glass` / `glassHover`

### 버튼 스타일

```tsx
import { getButtonStyle } from "@components/banner/banner-styles";

<Button sx={getButtonStyle("primary")} />;
```

### 기타 스타일

- `bannerContainerStyle` - 배너 컨테이너
- `iconContainerStyle` - 아이콘 컨테이너
- `closeButtonStyle` - 닫기 버튼
- `navigationButtonStyle` - 네비게이션 버튼
- `overlayStyle` - 오버레이/백드롭
- `glassmorphismStyle` - 글래스모피즘 효과

---

## 🎭 애니메이션 유틸리티 (`banner-animations.ts`)

다양한 keyframes 애니메이션을 제공합니다.

### 사용 예시

```tsx
import { fadeIn, slideIn, pulse } from "@components/banner/banner-animations";

<Box sx={{ animation: `${fadeIn} 0.5s ease-out` }} />;
```

### 사용 가능한 애니메이션

**페이드 효과:**

- `fadeIn` - 페이드인
- `fadeOut` - 페이드아웃
- `zoomIn` - 확대 페이드인
- `zoomOut` - 축소 페이드아웃

**슬라이드 효과:**

- `slideIn` - 아래에서 위로
- `slideInFromTop` - 위에서 아래로
- `slideInFromLeft` - 왼쪽에서
- `slideInFromRight` - 오른쪽에서

**펄스/글로우 효과:**

- `pulse` - 박스 쉐도우 펄스
- `pulseScale` - 스케일 펄스
- `glow` - 글로우 효과

**기타 효과:**

- `bounce` - 바운스
- `shake` - 흔들림
- `rotate` - 회전
- `iconBounce` - 아이콘 바운스
- `shimmer` - 반짝임
- `gradientMove` - 그라데이션 이동

---

## 🎯 디자인 원칙

### 1. 애니메이션

- **자연스러움**: cubic-bezier를 사용한 부드러운 트랜지션
- **성능**: transform과 opacity만 사용하여 60fps 유지
- **의미있음**: 사용자의 행동에 따른 피드백 제공

### 2. 색상

- **일관성**: 정의된 그라데이션 팔레트 사용
- **대비**: 접근성을 고려한 충분한 대비
- **계층**: 중요도에 따른 색상 구분

### 3. 간격

- **8의 배수**: MUI 테마에 맞춘 간격 사용
- **호흡**: 충분한 여백으로 가독성 확보
- **균형**: 시각적 균형을 위한 패딩/마진

### 4. 반응형

- **모바일 우선**: 작은 화면부터 디자인
- **유연함**: 다양한 화면 크기에 대응
- **터치 친화적**: 충분한 터치 영역 확보

---

## 🚀 향후 개선 가능 사항

1. **자동 재생**: 팝업 배너 자동 슬라이드
2. **스와이프**: 터치 제스처 지원
3. **다크모드**: 자동 테마 감지 및 적용
4. **접근성**: ARIA 속성 추가
5. **A/B 테스트**: 배너 성과 추적
6. **위치 커스터마이징**: 배너 표시 위치 옵션
7. **애니메이션 옵션**: 사용자가 애니메이션 선택 가능

---

## 📝 주의사항

1. **성능**: 한 번에 너무 많은 배너를 표시하지 않기 (권장: 최대 5개)
2. **이미지**: 최적화된 이미지 사용 (WebP 권장)
3. **접근성**: 키보드 네비게이션 테스트 필수
4. **테스트**: 다양한 디바이스에서 테스트
5. **사용자 경험**: "3일동안 보지 않기" 쿠키 만료 확인

---

## 🐛 문제 해결

### 애니메이션이 작동하지 않을 때

- MUI 테마가 올바르게 적용되었는지 확인
- keyframes가 올바르게 import 되었는지 확인

### 이미지가 표시되지 않을 때

- 이미지 URL이 올바른지 확인
- imageURL 설정이 올바른지 확인
- 이미지 파일이 존재하는지 확인

### 배너가 닫히지 않을 때

- API 엔드포인트가 정상 작동하는지 확인
- 네트워크 탭에서 요청 확인
- 에러 로그 확인

---

## 💡 팁

- **성능 최적화**: React.memo()로 불필요한 리렌더링 방지
- **코드 스플리팅**: 동적 import로 초기 로딩 시간 단축
- **프리로딩**: 중요한 이미지는 미리 로드
- **재사용**: 공통 스타일과 애니메이션 적극 활용

---

Made with ❤️ for better UX
