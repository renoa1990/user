import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <style>{`
          @font-face {
            font-family: 'SCDream';
            font-weight: 100;
            src: url('/fonts/SCDream1.otf') format('opentype');
            font-display: swap;
          }
          @font-face {
            font-family: 'SCDream';
            font-weight: 200;
            src: url('/fonts/SCDream2.otf') format('opentype');
            font-display: swap;
          }
          @font-face {
            font-family: 'SCDream';
            font-weight: 300;
            src: url('/fonts/SCDream3.otf') format('opentype');
            font-display: swap;
          }
          @font-face {
            font-family: 'SCDream';
            font-weight: 400;
            src: url('/fonts/SCDream4.otf') format('opentype');
            font-display: swap;
          }
          @font-face {
            font-family: 'SCDream';
            font-weight: 500;
            src: url('/fonts/SCDream5.otf') format('opentype');
            font-display: swap;
          }
          @font-face {
            font-family: 'SCDream';
            font-weight: 600;
            src: url('/fonts/SCDream6.otf') format('opentype');
            font-display: swap;
          }
          @font-face {
            font-family: 'SCDream';
            font-weight: 700;
            src: url('/fonts/SCDream7.otf') format('opentype');
            font-display: swap;
          }
          @font-face {
            font-family: 'SCDream';
            font-weight: 800;
            src: url('/fonts/SCDream8.otf') format('opentype');
            font-display: swap;
          }
          @font-face {
            font-family: 'SCDream';
            font-weight: 900;
            src: url('/fonts/SCDream9.otf') format('opentype');
            font-display: swap;
          }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
