"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Link as LinkIcon,
  PlayCircle,
} from "lucide-react";

type VideoWork = {
  id: string;
  titleZh: string;
  titleEn: string;
  clientZh: string;
  clientEn: string;
  year: string;
  categoryZh: string;
  categoryEn: string;
  roleZh: string;
  roleEn: string;
  url: string;
  noteZh: string;
  noteEn: string;
};

type PhotoProject = {
  id: string;
  titleZh: string;
  titleEn: string;
  clientZh: string;
  clientEn: string;
  year: string;
  categoryZh: string;
  categoryEn: string;
  roleZh: string;
  roleEn: string;
  cover: string;
  noteZh: string;
  noteEn: string;
  photos: string[];
};

type PortfolioData = {
  videos: VideoWork[];
  photos: PhotoProject[];
  updatedAt: string;
};

type IntroPhase =
  | "blackReveal"
  | "blackHold"
  | "whiteBlank"
  | "whiteReveal"
  | "whiteHold";

const PIXEL_COLUMNS = 42;
const PIXEL_ROWS = 6;
const REVEAL_DURATION = 3000;

function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function getYouTubeId(url: string) {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function getGoogleDriveId(url: string) {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc\?id=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function getEmbedData(url: string) {
  const youtubeId = getYouTubeId(url);

  if (youtubeId) {
    return {
      label: "YouTube",
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      icon: PlayCircle,
    };
  }

  const driveId = getGoogleDriveId(url);

  if (driveId) {
    return {
      label: "Google Drive",
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      icon: LinkIcon,
    };
  }

  return {
    label: "External Link",
    embedUrl: "",
    icon: ExternalLink,
  };
}

function ImageBox({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-900 text-neutral-700 ${className}`}
      >
        <ImageIcon className="h-8 w-8" />
      </div>
    );
  }

  return <img src={src} alt={alt} className={`object-cover ${className}`} />;
}

function BrandMark({ variant }: { variant: "dark" | "light" }) {
  return (
    <div className="absolute left-5 top-7 z-20 w-[315px] text-center md:left-8 md:top-8">
      <p className="font-serif text-[2rem] font-medium uppercase leading-none tracking-[0.08em] text-[#c8a96b] md:text-[2.45rem]">
        TOP JIMMY
      </p>
      <p
        className={[
          "mt-3 text-[0.7rem] leading-none md:text-[0.84rem]",
          variant === "dark" ? "text-stone-400" : "text-stone-500",
        ].join(" ")}
      >
        Videography / Photography / Visual Storytelling
      </p>
    </div>
  );
}

function PixelStrip({
  phase,
  stripColor,
  textColor,
}: {
  phase: IntroPhase;
  stripColor: string;
  textColor: string;
}) {
  const [elapsed, setElapsed] = useState(0);

  const isRevealPhase = phase === "blackReveal" || phase === "whiteReveal";
  const isHoldPhase = phase === "blackHold" || phase === "whiteHold";
  const isBlankPhase = phase === "whiteBlank";
  const showStrip = !isBlankPhase;

  const cells = useMemo(() => {
    const result: Array<{
      row: number;
      column: number;
      start: number;
    }> = [];

    for (let column = 0; column < PIXEL_COLUMNS; column += 1) {
      const columnBase =
        (column / Math.max(PIXEL_COLUMNS - 1, 1)) * (REVEAL_DURATION * 0.7) +
        seededNoise(column + 11) * 260;

      for (let row = 0; row < PIXEL_ROWS; row += 1) {
        const verticalGrowth = row * (110 + seededNoise(column * 13 + 5) * 55);
        const localJitter = seededNoise(column * 41 + row * 73 + 19) * 210;

        result.push({
          row,
          column,
          start: Math.min(
            columnBase + verticalGrowth + localJitter,
            REVEAL_DURATION - 90
          ),
        });
      }
    }

    return result;
  }, []);

  useEffect(() => {
    if (isRevealPhase) {
      setElapsed(0);

      let rafId = 0;
      const startTime = performance.now();

      const animate = (now: number) => {
        const nextElapsed = Math.min(now - startTime, REVEAL_DURATION);
        setElapsed(nextElapsed);

        if (nextElapsed < REVEAL_DURATION) {
          rafId = window.requestAnimationFrame(animate);
        }
      };

      rafId = window.requestAnimationFrame(animate);

      return () => {
        window.cancelAnimationFrame(rafId);
      };
    }

    if (isHoldPhase) {
      setElapsed(REVEAL_DURATION);
    }

    if (isBlankPhase) {
      setElapsed(0);
    }
  }, [phase, isRevealPhase, isHoldPhase, isBlankPhase]);

  const revealProgress = Math.min(elapsed / REVEAL_DURATION, 1);
  const isComplete = revealProgress >= 1 || isHoldPhase;

  const gapSize =
    isRevealPhase && !isComplete ? Math.max(0, 3 - revealProgress * 3) : 0;

  const radiusSize =
    isRevealPhase && !isComplete ? Math.max(0, 2 - revealProgress * 2) : 0;

  const viewBoxWidth = 1800;
  const viewBoxHeight = 320;
  const cellWidth = viewBoxWidth / PIXEL_COLUMNS;
  const cellHeight = viewBoxHeight / PIXEL_ROWS;

  const visibleCells = isComplete
    ? cells
    : cells.filter((cell) => elapsed >= cell.start);

  const maskId = `intro-pixel-mask-${phase}`;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-[32vh] min-h-[260px] w-screen overflow-hidden">
        {showStrip && (
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <mask id={maskId}>
                <rect
                  x="0"
                  y="0"
                  width={viewBoxWidth}
                  height={viewBoxHeight}
                  fill="black"
                />

                {isComplete ? (
                  <rect
                    x="0"
                    y="0"
                    width={viewBoxWidth}
                    height={viewBoxHeight}
                    fill="white"
                  />
                ) : (
                  visibleCells.map((cell, index) => (
                    <rect
                      key={`mask-cell-${index}`}
                      x={cell.column * cellWidth + gapSize / 2}
                      y={cell.row * cellHeight + gapSize / 2}
                      width={Math.max(cellWidth - gapSize, 0)}
                      height={Math.max(cellHeight - gapSize, 0)}
                      rx={radiusSize}
                      ry={radiusSize}
                      fill="white"
                    />
                  ))
                )}
              </mask>
            </defs>

            {isComplete ? (
              <rect
                x="0"
                y="0"
                width={viewBoxWidth}
                height={viewBoxHeight}
                fill={stripColor}
              />
            ) : (
              visibleCells.map((cell, index) => (
                <rect
                  key={`strip-cell-${index}`}
                  x={cell.column * cellWidth + gapSize / 2}
                  y={cell.row * cellHeight + gapSize / 2}
                  width={Math.max(cellWidth - gapSize, 0)}
                  height={Math.max(cellHeight - gapSize, 0)}
                  rx={radiusSize}
                  ry={radiusSize}
                  fill={stripColor}
                />
              ))
            )}

            <g mask={`url(#${maskId})`}>
              <text
                x="900"
                y="138"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={textColor}
                fontFamily='"Libre Baskerville", Georgia, serif'
                fontSize="50"
                letterSpacing="-0.7"
                textLength="1320"
                lengthAdjust="spacingAndGlyphs"
              >
                In the age of streaming, a refined eye subtracts the noise from
                the world.
              </text>

              <text
                x="900"
                y="210"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={textColor}
                fontFamily='"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif'
                fontSize="26"
                fontWeight="300"
                letterSpacing="7"
                textLength="660"
                lengthAdjust="spacing"
              >
                串流時代，用純粹的眼光，為世界做減法。
              </text>
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}

function IntroSection() {
  const [phase, setPhase] = useState<IntroPhase>("blackReveal");

  useEffect(() => {
    let timer: number | undefined;

    switch (phase) {
      case "blackReveal":
        timer = window.setTimeout(() => setPhase("blackHold"), 3000);
        break;
      case "blackHold":
        timer = window.setTimeout(() => setPhase("whiteBlank"), 3000);
        break;
      case "whiteBlank":
        timer = window.setTimeout(() => setPhase("whiteReveal"), 2000);
        break;
      case "whiteReveal":
        timer = window.setTimeout(() => setPhase("whiteHold"), 3000);
        break;
      case "whiteHold":
        timer = window.setTimeout(() => setPhase("blackReveal"), 3000);
        break;
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [phase]);

  const isWhiteStage =
    phase === "whiteBlank" || phase === "whiteReveal" || phase === "whiteHold";

  const backgroundColor = isWhiteStage ? "#f7f5ef" : "#101010";
  const stripColor = isWhiteStage ? "#050505" : "#ffffff";
  const textColor = isWhiteStage ? "#ffffff" : "#050505";

  return (
    <section
      className="relative h-screen shrink-0 snap-start overflow-hidden transition-colors duration-700"
      style={{ backgroundColor }}
    >
      <BrandMark variant={isWhiteStage ? "light" : "dark"} />

      <PixelStrip
        phase={phase}
        stripColor={stripColor}
        textColor={textColor}
      />

      <div
        className={[
          "absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-[10px] uppercase tracking-[0.28em]",
          isWhiteStage ? "text-stone-500" : "text-stone-600",
        ].join(" ")}
      >
        Scroll
      </div>
    </section>
  );
}

function SectionLabel({
  eyebrow,
  title,
  index,
}: {
  eyebrow: string;
  title: string;
  index: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#c8a96b]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-4xl font-medium tracking-[-0.055em] text-stone-50 md:text-6xl">
          {title}
        </h2>
      </div>
      <p className="hidden font-serif text-7xl leading-none text-white/[0.06] md:block">
        {index}
      </p>
    </div>
  );
}

function WorkMeta({
  label,
  zh,
  en,
}: {
  label: string;
  zh: string;
  en?: string;
}) {
  if (!zh && !en) return null;

  return (
    <div className="border-t border-white/10 py-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-stone-600">
        {label}
      </p>
      {zh && <p className="mt-2 text-sm text-stone-200">{zh}</p>}
      {en && <p className="mt-1 text-xs leading-5 text-stone-500">{en}</p>}
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex h-full items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03] text-sm text-stone-500">
      正在讀取 Google Sheet 作品資料...
    </div>
  );
}

function ErrorBlock({ error }: { error: string }) {
  return (
    <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-sm leading-7 text-red-200">
      <p className="font-semibold">讀取 Google Sheet 失敗</p>
      <p className="mt-2">{error}</p>
      <p className="mt-2">
        請確認 Vercel / .env.local 的 GOOGLE_SHEET_ID 正確，並且 Google Sheet
        已設定為知道連結者可檢視、且已發布到網路。
      </p>
    </div>
  );
}

function VideoWorksSection({
  videos,
  loading,
  error,
}: {
  videos: VideoWork[];
  loading: boolean;
  error: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeWork = videos[activeIndex] ?? videos[0];
  const embed = activeWork ? getEmbedData(activeWork.url) : null;
  const Icon = embed?.icon ?? Film;

  useEffect(() => {
    if (activeIndex > videos.length - 1) {
      setActiveIndex(0);
    }
  }, [videos.length, activeIndex]);

  return (
    <section className="min-h-screen shrink-0 snap-start bg-[#101010] px-5 py-8 text-stone-100 md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1500px] flex-col">
        <SectionLabel eyebrow="Motion Works" title="動態作品" index="01" />

        {loading && <LoadingBlock />}
        {!loading && error && <ErrorBlock error={error} />}

        {!loading && !error && !activeWork && (
          <div className="flex flex-1 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03] text-stone-500">
            目前沒有動態作品。
          </div>
        )}

        {!loading && !error && activeWork && embed && (
          <div className="grid flex-1 gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
            <motion.div
              key={activeWork.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl"
            >
              <div className="aspect-video">
                {embed.embedUrl ? (
                  <iframe
                    className="h-full w-full"
                    src={embed.embedUrl}
                    title={activeWork.titleEn || activeWork.titleZh}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 bg-neutral-900 text-stone-600">
                    <ExternalLink className="h-10 w-10" />
                    <p className="text-sm">此連結無法內嵌，請點外部連結觀看。</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.aside
              key={`${activeWork.id}-copy`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="flex flex-col justify-center"
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-stone-500">
                  <Icon className="h-3.5 w-3.5 text-[#c8a96b]" />
                  {embed.label}
                </span>
                <span className="text-xs text-stone-600">{activeWork.year}</span>
              </div>

              <h3 className="text-4xl font-medium leading-[0.95] tracking-[-0.055em] text-stone-50 md:text-6xl">
                {activeWork.titleZh || "未命名作品"}
              </h3>
              <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-[#c8a96b]">
                {activeWork.titleEn || "Untitled Work"}
              </p>

              <div className="mt-8 grid gap-x-6 md:grid-cols-2 lg:grid-cols-1">
                <WorkMeta
                  label="Client"
                  zh={activeWork.clientZh}
                  en={activeWork.clientEn}
                />
                <WorkMeta
                  label="Role"
                  zh={activeWork.roleZh}
                  en={activeWork.roleEn}
                />
                <WorkMeta
                  label="Category"
                  zh={activeWork.categoryZh}
                  en={activeWork.categoryEn}
                />
              </div>

              {(activeWork.noteZh || activeWork.noteEn) && (
                <div className="mt-6 space-y-4">
                  {activeWork.noteZh && (
                    <p className="text-sm leading-7 text-stone-300">
                      {activeWork.noteZh}
                    </p>
                  )}
                  {activeWork.noteEn && (
                    <p className="font-serif text-sm leading-7 text-stone-500">
                      {activeWork.noteEn}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={activeWork.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-black transition hover:bg-[#c8a96b]"
                >
                  Open Work
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </motion.aside>
          </div>
        )}

        {!loading && !error && videos.length > 1 && (
          <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
            {videos.map((work, index) => (
              <button
                key={work.id}
                onClick={() => setActiveIndex(index)}
                className={[
                  "min-w-fit rounded-full border px-4 py-2 text-xs transition",
                  activeIndex === index
                    ? "border-[#c8a96b] bg-[#c8a96b] text-black"
                    : "border-white/10 text-stone-500 hover:border-[#c8a96b]/60 hover:text-stone-100",
                ].join(" ")}
              >
                {String(index + 1).padStart(2, "0")} ·{" "}
                {work.titleZh || work.titleEn || "Untitled"}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PhotoWorksSection({
  photos,
  loading,
  error,
}: {
  photos: PhotoProject[];
  loading: boolean;
  error: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProject = photos[activeIndex] ?? photos[0];

  useEffect(() => {
    if (activeIndex > photos.length - 1) {
      setActiveIndex(0);
    }
  }, [photos.length, activeIndex]);

  return (
    <section className="min-h-screen shrink-0 snap-start bg-[#f7f5ef] px-5 py-8 text-neutral-950 md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1500px] flex-col">
        <div className="mb-8 flex items-end justify-between border-b border-black/10 pb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#9c7a3c]">
              Still Works
            </p>
            <h2 className="mt-2 text-4xl font-medium tracking-[-0.055em] text-neutral-950 md:text-6xl">
              平面作品
            </h2>
          </div>
          <p className="hidden font-serif text-7xl leading-none text-black/[0.06] md:block">
            02
          </p>
        </div>

        {loading && (
          <div className="flex h-full items-center justify-center rounded-[2rem] border border-black/10 bg-black/[0.03] text-sm text-neutral-500">
            正在讀取 Google Sheet 作品資料...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-sm leading-7 text-red-700">
            <p className="font-semibold">讀取 Google Sheet 失敗</p>
            <p className="mt-2">{error}</p>
          </div>
        )}

        {!loading && !error && !activeProject && (
          <div className="flex flex-1 items-center justify-center rounded-[2rem] border border-black/10 bg-black/[0.03] text-neutral-500">
            目前沒有平面作品。
          </div>
        )}

        {!loading && !error && activeProject && (
          <div className="grid flex-1 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <motion.div
              key={activeProject.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="grid grid-cols-3 gap-2"
            >
              {activeProject.photos.slice(0, 6).map((photo, index) => (
                <a
                  key={`${activeProject.id}-${photo}-${index}`}
                  href={photo}
                  target="_blank"
                  rel="noreferrer"
                  className={[
                    "group relative overflow-hidden bg-neutral-200",
                    index === 0
                      ? "col-span-2 row-span-2 aspect-square rounded-[2rem]"
                      : "aspect-square rounded-[1.35rem]",
                  ].join(" ")}
                >
                  <ImageBox
                    src={photo}
                    alt={`${activeProject.titleEn} preview ${index + 1}`}
                    className="h-full w-full transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                  <span className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </a>
              ))}
            </motion.div>

            <motion.aside
              key={`${activeProject.id}-copy`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="flex flex-col justify-center"
            >
              <p className="mb-5 text-xs text-neutral-500">
                {activeProject.year} · {activeProject.categoryZh}
              </p>

              <h3 className="text-4xl font-medium leading-[0.95] tracking-[-0.055em] text-neutral-950 md:text-6xl">
                {activeProject.titleZh || "未命名作品"}
              </h3>
              <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-[#9c7a3c]">
                {activeProject.titleEn || "Untitled Work"}
              </p>

              <div className="mt-8 grid gap-x-6 md:grid-cols-2">
                {(activeProject.clientZh || activeProject.clientEn) && (
                  <div className="border-t border-black/10 py-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-400">
                      Client
                    </p>
                    <p className="mt-2 text-sm text-neutral-900">
                      {activeProject.clientZh}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      {activeProject.clientEn}
                    </p>
                  </div>
                )}

                {(activeProject.roleZh || activeProject.roleEn) && (
                  <div className="border-t border-black/10 py-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-400">
                      Role
                    </p>
                    <p className="mt-2 text-sm text-neutral-900">
                      {activeProject.roleZh}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      {activeProject.roleEn}
                    </p>
                  </div>
                )}
              </div>

              {(activeProject.noteZh || activeProject.noteEn) && (
                <div className="mt-6 space-y-4">
                  {activeProject.noteZh && (
                    <p className="text-sm leading-7 text-neutral-700">
                      {activeProject.noteZh}
                    </p>
                  )}
                  {activeProject.noteEn && (
                    <p className="font-serif text-sm leading-7 text-neutral-500">
                      {activeProject.noteEn}
                    </p>
                  )}
                </div>
              )}
            </motion.aside>
          </div>
        )}

        {!loading && !error && photos.length > 1 && (
          <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
            {photos.map((project, index) => (
              <button
                key={project.id}
                onClick={() => setActiveIndex(index)}
                className={[
                  "min-w-fit rounded-full border px-4 py-2 text-xs transition",
                  activeIndex === index
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-black/10 text-neutral-500 hover:border-neutral-950 hover:text-neutral-950",
                ].join(" ")}
              >
                {String(index + 1).padStart(2, "0")} ·{" "}
                {project.titleZh || project.titleEn || "Untitled"}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const [videos, setVideos] = useState<VideoWork[]>([]);
  const [photos, setPhotos] = useState<PhotoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPortfolio() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/portfolio", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load portfolio data");
        }

        const portfolio = data as PortfolioData;

        setVideos(portfolio.videos);
        setPhotos(portfolio.photos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, []);

  const sortedVideos = useMemo(() => videos, [videos]);
  const sortedPhotos = useMemo(() => photos, [photos]);

  return (
    <main className="h-screen snap-y snap-mandatory overflow-y-auto scroll-smooth bg-[#101010]">
      <IntroSection />

      <VideoWorksSection
        videos={sortedVideos}
        loading={loading}
        error={error}
      />

      <PhotoWorksSection
        photos={sortedPhotos}
        loading={loading}
        error={error}
      />
    </main>
  );
}