//components/AnimatedSpaceBg.tsx
"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** 별 개수(레이어 합계). 기본 500 */
  stars?: number;
  /** 깊이감 강도 (1=기본) */
  parallax?: number;
  /** 유성(초당 평균 등장 확률) 0~1 */
  meteorChance?: number;
  /** 전체 속도 배율 */
  speed?: number;
  /** 배경색 */
  baseColor?: string;
};

type Star = {
  x: number; // 0~1
  y: number; // 0~1
  z: number; // 0~1 (깊이)
  b: number; // 밝기 0.3~1
  tw: number; // 반짝임 위상
};

export default function AnimatedSpaceBg({
  stars = 500,
  parallax = 1,
  meteorChance = 0.02,
  speed = 1,
  baseColor = "#07090e", // 아주 진한 네이비
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const parent = canvas.parentElement!;
      const { clientWidth: w, clientHeight: h } = parent;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    // ---------- 스타필드 초기화 ----------
    // 깊이 레이어 비율: 얕은(빠름) : 중간 : 깊은(느림)
    const starsDeep = Math.floor(stars * 0.45);
    const starsMid = Math.floor(stars * 0.35);
    const starsNear = stars - starsDeep - starsMid;

    const makeStar = (z: number): Star => ({
      x: Math.random(),
      y: Math.random(),
      z, // 깊이
      b: 0.3 + Math.random() * 0.7,
      tw: Math.random() * Math.PI * 2,
    });

    const starField: Star[] = [
      ...Array.from({ length: starsDeep }, () =>
        makeStar(0.2 + Math.random() * 0.3)
      ),
      ...Array.from({ length: starsMid }, () =>
        makeStar(0.5 + Math.random() * 0.3)
      ),
      ...Array.from({ length: starsNear }, () =>
        makeStar(0.85 + Math.random() * 0.15)
      ),
    ];

    // 유성(짧게 지나가는 라인) 풀
    type Meteor = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    };
    const meteors: Meteor[] = [];

    let t = 0;
    const loop = () => {
      t += 0.016 * speed;
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;

      // 배경 + 은하수(네뷸라) 그라데이션
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, w, h);

      // 은은한 네뷸라(큰 소프트 그라디언트 두 개)
      const neb1 = ctx.createRadialGradient(
        w * 0.7,
        h * 0.35,
        0,
        w * 0.7,
        h * 0.35,
        Math.max(w, h) * 0.7
      );
      neb1.addColorStop(0, "rgba(90,120,255,0.06)");
      neb1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, w, h);

      const neb2 = ctx.createRadialGradient(
        w * 0.3,
        h * 0.65,
        0,
        w * 0.3,
        h * 0.65,
        Math.max(w, h) * 0.6
      );
      neb2.addColorStop(0, "rgba(255,120,160,0.04)");
      neb2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, w, h);

      // 패럴랙스 오프셋(마우스 없이 느린 드리프트)
      const driftX = Math.sin(t * 0.07) * 0.02 * parallax; // -0.02~0.02
      const driftY = Math.cos(t * 0.05) * 0.02 * parallax;

      // 별 그리기
      for (const s of starField) {
        // z(깊이)가 클수록 느리게 이동
        const v = (0.02 + (1 - s.z) * 0.05) * speed;
        // 상향 드리프트
        s.y -= v * 0.003;
        if (s.y < -0.02) s.y = 1.02; // 위로 빠져나가면 아래로 재배치

        // 반짝임
        s.tw += 0.02 + (1 - s.z) * 0.02;
        const twinkle = 0.75 + Math.sin(s.tw) * 0.25;

        const px = (s.x + driftX * (s.z - 0.5)) * w;
        const py = (s.y + driftY * (s.z - 0.5)) * h;

        const radius = 0.6 + s.z * 1.2; // 가까울수록 큼
        const a = 0.3 * s.b * twinkle;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 유성 스폰
      if (Math.random() < meteorChance * 0.016) {
        // 오른쪽 위에서 왼쪽 아래로 살짝 대각선
        const startX = w * (0.6 + Math.random() * 0.4);
        const startY = h * (Math.random() * 0.4);
        meteors.push({
          x: startX,
          y: startY,
          vx: -(3 + Math.random() * 2) * speed,
          vy: (2 + Math.random() * 1.5) * speed,
          life: 1,
        });
      }

      // 유성 업데이트/렌더
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.02 * speed;

        // 꼬리(그라디언트 스트릭)
        const grad = ctx.createLinearGradient(
          m.x,
          m.y,
          m.x - m.vx * 10,
          m.y - m.vy * 10
        );
        grad.addColorStop(0, "rgba(255,255,255,0.8)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12);
        ctx.stroke();

        if (m.life <= 0 || m.x < -50 || m.y > h + 50) {
          meteors.splice(i, 1);
        }
      }

      // 비네팅으로 시선 집중
      const vignette = ctx.createRadialGradient(
        w / 2,
        h * 0.5,
        Math.min(w, h) * 0.2,
        w / 2,
        h * 0.5,
        Math.max(w, h) * 0.9
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [stars, parallax, meteorChance, speed, baseColor]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none", // ✅ 클릭 패스스루
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
