"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Camera,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Link as LinkIcon,
  PlayCircle,
  Search,
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

function MetaLine({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  if (!value && !subValue) return null;

  return (
    <div className="border-t border-white/[0.08] py-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">
        {label}
      </p>
      {value && <p className="mt-2 text-sm text-stone-200">{value}</p>}
      {subValue && (
        <p className="mt-1 text-xs leading-5 text-stone-500">{subValue}</p>
      )}
    </div>
  );
}

function ProjectTitle({
  zh,
  en,
  large = false,
}: {
  zh: string;
  en: string;
  large?: boolean;
}) {
  return (
    <div>
      <h3
        className={[
          "font-medium tracking-[-0.04em] text-stone-50",
          large
            ? "text-4xl leading-[0.95] md:text-6xl"
            : "text-2xl leading-tight md:text-3xl",
        ].join(" ")}
      >
        {zh || "未命名作品"}
      </h3>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.28em] text-[#c8a96b]">
        {en || "Untitled Work"}
      </p>
    </div>
  );
}

function Description({
  zh,
  en,
  compact = false,
}: {
  zh: string;
  en: string;
  compact?: boolean;
}) {
  if (!zh && !en) return null;

  return (
    <div className={compact ? "mt-5 space-y-3" : "mt-7 space-y-4"}>
      {zh && (
        <p className="text-sm leading-7 text-stone-300 md:text-[15px]">
          {zh}
        </p>
      )}
      {en && <p className="text-xs leading-6 text-stone-500 md:text-sm">{en}</p>}
    </div>
  );
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
        className={`flex items-center justify-center bg-[#111214] text-stone-700 ${className}`}
      >
        <ImageIcon className="h-8 w-8" />
      </div>
    );
  }

  return <img src={src} alt={alt} className={`object-cover ${className}`} />;
}

function EmptyState({ type }: { type: "video" | "photo" }) {
  return (
    <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.025] p-12 text-center">
      {type === "video" ? (
        <Film className="mx-auto mb-4 h-10 w-10 text-stone-600" />
      ) : (
        <ImageIcon className="mx-auto mb-4 h-10 w-10 text-stone-600" />
      )}
      <p className="text-sm tracking-wide text-stone-500">
        目前沒有符合條件的作品。
      </p>
    </div>
  );
}

function CinematicHeroStrip() {
  const panels = Array.from({ length: 14 }, (_, index) => index);

  return (
    <section className="relative w-full overflow-hidden border-y border-white/[0.08]">
      <div className="relative h-[230px] md:h-[310px] lg:h-[350px]">
        <div className="absolute inset-0 grid grid-cols-[repeat(14,minmax(0,1fr))]">
          {panels.map((panel, index) => (
            <motion.div
              key={panel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.42,
                delay: index * 0.075,
                ease: "easeOut",
              }}
              className={index % 2 === 0 ? "bg-black" : "bg-white"}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.22),transparent_18%,transparent_82%,rgba(0,0,0,0.22))]" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.15,
              delay: 0.75,
              ease: "easeOut",
            }}
            className="max-w-5xl font-serif text-[1.05rem] leading-relaxed tracking-[0.01em] text-white mix-blend-difference md:text-[1.5rem] lg:text-[1.95rem]"
          >
            In the age of streaming, a refined eye subtracts the noise from the
            world.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.05,
              delay: 1.75,
              ease: "easeOut",
            }}
            className="mt-5 text-sm font-medium tracking-[0.16em] text-white mix-blend-difference md:mt-6 md:text-base lg:text-lg"
          >
            串流時代，用純粹的眼光，為世界做減法。
          </motion.p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [mode, setMode] = useState<"video" | "photo">("video");
  const [videos, setVideos] = useState<VideoWork[]>([]);
  const [photos, setPhotos] = useState<PhotoProject[]>([]);
  const [query, setQuery] = useState("");
  const [selectedPhotoId, setSelectedPhotoId] = useState("");
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
        setSelectedPhotoId(portfolio.photos[0]?.id ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, []);

  const filteredVideos = useMemo(() => {
    const q = query.trim().toLowerCase();

    return videos.filter((work) => {
      const text = [
        work.titleZh,
        work.titleEn,
        work.clientZh,
        work.clientEn,
        work.categoryZh,
        work.categoryEn,
        work.roleZh,
        work.roleEn,
        work.noteZh,
        work.noteEn,
        work.year,
      ]
        .join(" ")
        .toLowerCase();

      return !q || text.includes(q);
    });
  }, [videos, query]);

  const filteredPhotos = useMemo(() => {
    const q = query.trim().toLowerCase();

    return photos.filter((project) => {
      const text = [
        project.titleZh,
        project.titleEn,
        project.clientZh,
        project.clientEn,
        project.categoryZh,
        project.categoryEn,
        project.roleZh,
        project.roleEn,
        project.noteZh,
        project.noteEn,
        project.year,
      ]
        .join(" ")
        .toLowerCase();

      return !q || text.includes(q);
    });
  }, [photos, query]);

  const selectedPhotoProject =
    photos.find((project) => project.id === selectedPhotoId) ??
    filteredPhotos[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0b0d] text-stone-100">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(200,169,107,0.16),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.07),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_18%)]" />

      <section className="relative z-10">
        <div className="mx-auto max-w-[1500px] px-5 py-6 md:px-8">
          <nav className="flex items-center justify-between border-b border-white/[0.08] pb-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-[#c8a96b]">
                TOP JIMMY
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Videography / Photography / Visual Storytelling
              </p>
            </div>

            <a
              href="mailto:yourmail@example.com"
              className="group hidden items-center gap-2 rounded-full border border-white/[0.1] px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-400 transition hover:border-[#c8a96b]/60 hover:text-stone-100 md:inline-flex"
            >
              Contact
              <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </nav>
        </div>

        <CinematicHeroStrip />

        <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-8 md:py-16">
          <div className="grid gap-10 border-b border-white/[0.08] pb-12 md:grid-cols-[1.05fr_0.95fr] md:items-end">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#c8a96b]">
                TOP JIMMY
              </p>

              <h1 className="mt-4 text-5xl font-medium leading-[0.9] tracking-[-0.065em] text-stone-50 md:text-7xl lg:text-[6.4rem]">
                VISUAL
                <br />
                PORTFOLIO
              </h1>
            </div>

            <div className="space-y-5 md:pb-2">
              <p className="max-w-xl text-[15px] leading-8 text-stone-300">
                串流時代，用純粹的眼光，為世界做減法。
              </p>

              <p className="max-w-xl font-serif text-sm leading-7 text-stone-500">
                In the age of streaming, a refined eye subtracts the noise from
                the world.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setMode("video")}
                  className={`rounded-full px-5 py-3 text-xs uppercase tracking-[0.2em] transition ${
                    mode === "video"
                      ? "bg-[#c8a96b] text-black"
                      : "border border-white/[0.1] text-stone-400 hover:border-[#c8a96b]/60 hover:text-stone-100"
                  }`}
                >
                  Video Works
                </button>

                <button
                  onClick={() => setMode("photo")}
                  className={`rounded-full px-5 py-3 text-xs uppercase tracking-[0.2em] transition ${
                    mode === "photo"
                      ? "bg-[#c8a96b] text-black"
                      : "border border-white/[0.1] text-stone-400 hover:border-[#c8a96b]/60 hover:text-stone-100"
                  }`}
                >
                  Photo Works
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1500px] px-5 pb-24 md:px-8">
        <div className="mb-10 grid gap-6 border-y border-white/[0.08] py-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#c8a96b]">
              {mode === "video" ? "Motion Works" : "Still Works"}
            </p>
            <h2 className="mt-2 text-4xl font-medium tracking-[-0.05em] text-stone-50 md:text-6xl">
              {mode === "video" ? "動態作品" : "平面作品"}
            </h2>
          </div>

          <div className="relative w-full lg:w-[420px]">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
            <input
              className="w-full rounded-full border border-white/[0.08] bg-white/[0.035] py-4 pl-12 pr-5 text-sm text-stone-200 outline-none transition placeholder:text-stone-600 focus:border-[#c8a96b]/60"
              placeholder="搜尋作品、客戶、分類 / Search works"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.025] p-12 text-center text-stone-500">
            正在讀取 Google Sheet 作品資料...
          </div>
        )}

        {error && (
          <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-sm leading-7 text-red-200">
            <p className="font-semibold">讀取 Google Sheet 失敗</p>
            <p className="mt-2">{error}</p>
            <p className="mt-2">
              請確認 Vercel / .env.local 的 GOOGLE_SHEET_ID 正確，並且 Google
              Sheet 已設定為知道連結者可檢視、且已發布到網路。
            </p>
          </div>
        )}

        {!loading && !error && mode === "video" && (
          <>
            <div className="grid gap-8 xl:grid-cols-2">
              {filteredVideos.map((work, index) => {
                const embed = getEmbedData(work.url);
                const Icon = embed.icon;

                return (
                  <motion.article
                    key={work.id}
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                    className="group overflow-hidden rounded-[2.2rem] border border-white/[0.08] bg-white/[0.03] transition duration-500 hover:border-[#c8a96b]/40 hover:bg-white/[0.045]"
                  >
                    <div className="aspect-video overflow-hidden bg-black">
                      {embed.embedUrl ? (
                        <iframe
                          className="h-full w-full"
                          src={embed.embedUrl}
                          title={work.titleEn || work.titleZh}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#111214] text-stone-600">
                          <ExternalLink className="h-9 w-9" />
                          <p className="text-sm">
                            此連結無法內嵌，請點外部連結觀看。
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-7 md:p-9">
                      <div className="mb-7 flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-stone-500">
                          <Icon className="h-3.5 w-3.5 text-[#c8a96b]" />
                          {embed.label}
                        </span>
                        <span className="text-xs text-stone-600">
                          {work.year}
                        </span>
                      </div>

                      <ProjectTitle zh={work.titleZh} en={work.titleEn} />

                      <div className="mt-8 grid gap-x-7 md:grid-cols-3">
                        <MetaLine
                          label="Client"
                          value={work.clientZh}
                          subValue={work.clientEn}
                        />
                        <MetaLine
                          label="Category"
                          value={work.categoryZh}
                          subValue={work.categoryEn}
                        />
                        <MetaLine
                          label="Role"
                          value={work.roleZh}
                          subValue={work.roleEn}
                        />
                      </div>

                      <Description zh={work.noteZh} en={work.noteEn} compact />

                      <a
                        href={work.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-8 inline-flex items-center gap-2 rounded-full bg-stone-100 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-black transition hover:bg-[#c8a96b]"
                      >
                        Open Work
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            {filteredVideos.length === 0 && <EmptyState type="video" />}
          </>
        )}

        {!loading && !error && mode === "photo" && (
          <>
            <div className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr]">
              <div className="space-y-4">
                {filteredPhotos.map((project, index) => (
                  <motion.article
                    key={project.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.42, delay: index * 0.05 }}
                    onClick={() => setSelectedPhotoId(project.id)}
                    className={`group cursor-pointer overflow-hidden rounded-[2rem] border transition duration-500 ${
                      selectedPhotoProject?.id === project.id
                        ? "border-[#c8a96b]/60 bg-[#c8a96b]/10"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-[#c8a96b]/35 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="grid gap-5 p-4 md:grid-cols-[150px_1fr] md:p-5">
                      <div className="aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-[#111214]">
                        <ImageBox
                          src={project.cover}
                          alt={project.titleEn || project.titleZh}
                          className="h-full w-full transition duration-700 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex min-w-0 flex-col justify-center">
                        <div className="mb-4 flex items-center gap-3">
                          <span className="text-[10px] uppercase tracking-[0.24em] text-[#c8a96b]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.22em] text-stone-600">
                            {project.photos.length} Photos
                          </span>
                        </div>

                        <h3 className="text-2xl font-medium tracking-[-0.045em] text-stone-50">
                          {project.titleZh || "未命名作品"}
                        </h3>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-stone-500">
                          {project.titleEn || "Untitled Work"}
                        </p>

                        <p className="mt-4 text-sm text-stone-500">
                          {project.year} · {project.categoryZh}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {selectedPhotoProject && (
                <motion.div
                  key={selectedPhotoProject.id}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="xl:sticky xl:top-6 xl:self-start"
                >
                  <div className="overflow-hidden rounded-[2.4rem] border border-white/[0.08] bg-white/[0.035]">
                    <div className="p-7 md:p-10">
                      <div className="mb-7 flex flex-wrap gap-3">
                        <span className="rounded-full border border-white/[0.08] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-stone-500">
                          {selectedPhotoProject.categoryZh}
                        </span>
                        <span className="rounded-full border border-white/[0.08] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-stone-500">
                          {selectedPhotoProject.year}
                        </span>
                      </div>

                      <ProjectTitle
                        zh={selectedPhotoProject.titleZh}
                        en={selectedPhotoProject.titleEn}
                        large
                      />

                      <div className="mt-10 grid gap-x-8 md:grid-cols-2">
                        <MetaLine
                          label="Client"
                          value={selectedPhotoProject.clientZh}
                          subValue={selectedPhotoProject.clientEn}
                        />
                        <MetaLine
                          label="Role"
                          value={selectedPhotoProject.roleZh}
                          subValue={selectedPhotoProject.roleEn}
                        />
                      </div>

                      <Description
                        zh={selectedPhotoProject.noteZh}
                        en={selectedPhotoProject.noteEn}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-3">
                      {selectedPhotoProject.photos.slice(0, 6).map((photo, i) => (
                        <a
                          key={`${selectedPhotoProject.id}-${photo}-${i}`}
                          href={photo}
                          target="_blank"
                          rel="noreferrer"
                          className={`group relative overflow-hidden bg-[#111214] ${
                            i === 0
                              ? "col-span-2 aspect-[4/3] rounded-[1.8rem] md:col-span-2"
                              : "aspect-square rounded-[1.4rem]"
                          }`}
                        >
                          <ImageBox
                            src={photo}
                            alt={`${selectedPhotoProject.titleEn} preview ${
                              i + 1
                            }`}
                            className="h-full w-full transition duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/25" />
                          <span className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {filteredPhotos.length === 0 && <EmptyState type="photo" />}
          </>
        )}
      </section>
    </main>
  );
}