"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
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

function BilingualTitle({
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
        className={`font-semibold tracking-tight text-white ${
          large ? "text-3xl md:text-4xl" : "text-xl"
        }`}
      >
        {zh || "未命名作品"}
      </h3>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
        {en || "Untitled Work"}
      </p>
    </div>
  );
}

function InfoBlock({
  labelZh,
  labelEn,
  zh,
  en,
}: {
  labelZh: string;
  labelEn: string;
  zh: string;
  en: string;
}) {
  if (!zh && !en) return null;

  return (
    <div className="rounded-2xl bg-white/[0.05] p-3">
      <p className="text-xs text-neutral-500">
        {labelZh} / {labelEn}
      </p>
      {zh && <p className="mt-1 text-sm text-neutral-200">{zh}</p>}
      {en && <p className="mt-0.5 text-xs leading-5 text-neutral-400">{en}</p>}
    </div>
  );
}

function NoteBlock({ zh, en }: { zh: string; en: string }) {
  if (!zh && !en) return null;

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      {zh && (
        <p className="text-sm leading-6 text-neutral-200">
          <span className="mr-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-neutral-400">
            中文
          </span>
          {zh}
        </p>
      )}

      {en && (
        <p className="text-sm leading-6 text-neutral-400">
          <span className="mr-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-neutral-500">
            EN
          </span>
          {en}
        </p>
      )}
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
        className={`flex items-center justify-center rounded-2xl bg-neutral-900 text-neutral-600 ${className}`}
      >
        <ImageIcon className="h-8 w-8" />
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={`object-cover ${className}`} />
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
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.09),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-neutral-300">
              <Camera className="h-4 w-4" />
              Bilingual Video & Photo Portfolio
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Jimmy Portfolio
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-300 md:text-lg">
              中英文對照的影像作品集。影片作品與平面攝影作品皆由 Google Sheet
              管理，更新資料後網站會自動讀取最新內容。
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-neutral-300">
              <span className="rounded-full bg-white/10 px-4 py-2">
                影片作品 / Video Works
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2">
                平面作品 / Photo Works
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2">
                Google Sheet CMS
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2">
                Bilingual Copy
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur"
          >
            <div className="grid grid-cols-3 gap-2">
              {(photos[0]?.photos ?? []).slice(0, 6).map((photo, index) => (
                <div
                  key={`${photo}-${index}`}
                  className={`aspect-square overflow-hidden rounded-2xl bg-neutral-900 ${
                    index === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <ImageBox
                    src={photo}
                    alt="Portfolio preview"
                    className="h-full w-full"
                  />
                </div>
              ))}

              {!photos[0] &&
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className={`aspect-square overflow-hidden rounded-2xl bg-neutral-900 ${
                      index === 0 ? "col-span-2 row-span-2" : ""
                    }`}
                  />
                ))}
            </div>

            <div className="flex items-start gap-4 p-5">
              <div className="rounded-2xl bg-white/10 p-3">
                <ImageIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="text-lg font-semibold text-white">
                  作品資料來源 / Data Source
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-300">
                  作品內容由 Google Sheet 控制。新增、排序、隱藏作品都可直接在表格內完成。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-10 lg:px-10">
        <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-2 md:grid-cols-2">
          <button
            onClick={() => setMode("video")}
            className={`flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold transition ${
              mode === "video"
                ? "bg-white text-neutral-950"
                : "text-neutral-300 hover:bg-white/10"
            }`}
          >
            <PlayCircle className="h-5 w-5" />
            動態作品 / Video Works
          </button>

          <button
            onClick={() => setMode("photo")}
            className={`flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold transition ${
              mode === "photo"
                ? "bg-white text-neutral-950"
                : "text-neutral-300 hover:bg-white/10"
            }`}
          >
            <ImageIcon className="h-5 w-5" />
            平面作品 / Photo Works
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {mode === "video"
                ? "動態作品 / Video Works"
                : "平面作品 / Photo Works"}
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              {mode === "video"
                ? `目前共有 ${videos.length} 個影片作品`
                : `目前共有 ${photos.length} 個平面作品專案`}
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/[0.07] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-white/30"
              placeholder="搜尋中英文作品、客戶、分類"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-neutral-400">
            正在讀取 Google Sheet 作品資料...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm leading-7 text-red-200">
            <p className="font-semibold">讀取 Google Sheet 失敗</p>
            <p className="mt-2">{error}</p>
            <p className="mt-2">
              請確認 .env.local 的 GOOGLE_SHEET_ID 正確，並且 Google Sheet
              已設定為知道連結者可檢視、且已發布到網路。
            </p>
          </div>
        )}

        {!loading && !error && mode === "video" && (
          <div className="grid gap-6 xl:grid-cols-2">
            {filteredVideos.map((work, index) => {
              const embed = getEmbedData(work.url);
              const Icon = embed.icon;

              return (
                <motion.article
                  key={work.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] shadow-xl transition hover:-translate-y-1 hover:bg-white/[0.1]"
                >
                  <div className="aspect-video bg-black">
                    {embed.embedUrl ? (
                      <iframe
                        className="h-full w-full"
                        src={embed.embedUrl}
                        title={work.titleEn || work.titleZh}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 bg-neutral-900 text-neutral-400">
                        <ExternalLink className="h-8 w-8" />
                        <p className="text-sm">
                          此連結無法內嵌，請點外部連結觀看。
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-neutral-300">
                        <Icon className="h-3.5 w-3.5" />
                        {embed.label}
                      </span>
                    </div>

                    <BilingualTitle zh={work.titleZh} en={work.titleEn} />

                    <div className="mt-4 grid gap-3">
                      <InfoBlock
                        labelZh="客戶 / 專案"
                        labelEn="Client / Project"
                        zh={work.clientZh}
                        en={work.clientEn}
                      />
                      <InfoBlock
                        labelZh="分類"
                        labelEn="Category"
                        zh={work.categoryZh}
                        en={work.categoryEn}
                      />
                      <InfoBlock
                        labelZh="角色"
                        labelEn="Role"
                        zh={work.roleZh}
                        en={work.roleEn}
                      />
                    </div>

                    <p className="mt-3 text-xs text-neutral-500">
                      年份 / Year：{work.year}
                    </p>

                    <NoteBlock zh={work.noteZh} en={work.noteEn} />

                    <a
                      href={work.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-200 transition hover:border-white/30 hover:bg-white/10"
                    >
                      開啟原始連結 / Open Source Link
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {!loading && !error && mode === "photo" && (
          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="grid gap-4">
              {filteredPhotos.map((project, index) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  onClick={() => setSelectedPhotoId(project.id)}
                  className={`cursor-pointer overflow-hidden rounded-3xl border shadow-xl transition hover:-translate-y-1 ${
                    selectedPhotoProject?.id === project.id
                      ? "border-white/40 bg-white/[0.14]"
                      : "border-white/10 bg-white/[0.07] hover:bg-white/[0.1]"
                  }`}
                >
                  <div className="grid gap-4 p-4 md:grid-cols-[120px_1fr]">
                    <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-900">
                      <ImageBox
                        src={project.cover}
                        alt={project.titleEn || project.titleZh}
                        className="h-full w-full"
                      />
                    </div>

                    <div className="flex min-w-0 flex-col justify-center">
                      <span className="mb-2 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-neutral-300">
                        <ImageIcon className="h-3.5 w-3.5" />
                        {project.photos.length} Photos
                      </span>

                      <BilingualTitle
                        zh={project.titleZh}
                        en={project.titleEn}
                      />

                      <p className="mt-2 text-sm text-neutral-400">
                        {project.year} · {project.categoryZh}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {project.categoryEn}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {selectedPhotoProject && (
              <div className="xl:sticky xl:top-6 xl:self-start">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] shadow-xl">
                  <div className="p-6">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-neutral-300">
                        {selectedPhotoProject.categoryZh}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-neutral-300">
                        {selectedPhotoProject.categoryEn}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-neutral-300">
                        {selectedPhotoProject.year}
                      </span>
                    </div>

                    <BilingualTitle
                      zh={selectedPhotoProject.titleZh}
                      en={selectedPhotoProject.titleEn}
                      large
                    />

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <InfoBlock
                        labelZh="客戶 / 專案"
                        labelEn="Client / Project"
                        zh={selectedPhotoProject.clientZh}
                        en={selectedPhotoProject.clientEn}
                      />
                      <InfoBlock
                        labelZh="角色"
                        labelEn="Role"
                        zh={selectedPhotoProject.roleZh}
                        en={selectedPhotoProject.roleEn}
                      />
                    </div>

                    <NoteBlock
                      zh={selectedPhotoProject.noteZh}
                      en={selectedPhotoProject.noteEn}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-3">
                    {selectedPhotoProject.photos.slice(0, 6).map((photo, i) => (
                      <a
                        key={`${selectedPhotoProject.id}-${photo}-${i}`}
                        href={photo}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-900"
                      >
                        <ImageBox
                          src={photo}
                          alt={`${selectedPhotoProject.titleEn} preview ${
                            i + 1
                          }`}
                          className="h-full w-full transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white backdrop-blur">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading &&
          !error &&
          mode === "video" &&
          filteredVideos.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-10 text-center text-neutral-400">
              <Film className="mx-auto mb-4 h-10 w-10" />
              <p>目前沒有符合條件的影片作品。</p>
            </div>
          )}

        {!loading &&
          !error &&
          mode === "photo" &&
          filteredPhotos.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-10 text-center text-neutral-400">
              <ImageIcon className="mx-auto mb-4 h-10 w-10" />
              <p>目前沒有符合條件的平面作品。</p>
            </div>
          )}
      </section>
    </main>
  );
}