# Custom mockups

Place your transparent PNG mockup files in this folder, then register each asset in `manifest.json`.

Recommended structure:

- `overlays/ecommerce/`: 상세페이지·랜딩 상세 목업.
- `overlays/app/`: 모바일 앱·태블릿 앱 목업.
- `overlays/web/`: 웹사이트·대시보드·SaaS 화면 목업.
- `overlays/poster/`: 포스터·전시·인쇄물 목업.
- `overlays/banner/`: 와이드 배너·광고판 목업.
- `overlays/social/`: 소셜 피드·정사각 광고 목업.
- `overlays/ads/`: 도시 광고·옥외 광고 목업.
- `overlays/signage/`: 간판·원형 사인 목업.
- `overlays/samples/`: 기본 테스트 목업.
- `images/`: optional local sample/user-image references for future testing. Runtime uploads are still handled in the browser and are not sent to a server.

```json
{
  "mockups": [
    {
      "id": "phone-dark",
      "label": "Dark phone",
      "category": "앱 목업",
      "src": "mockups/overlays/app/phone-dark.png"
    }
  ]
}
```
