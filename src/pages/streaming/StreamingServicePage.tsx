import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";

import { WideContainer } from "@/components/layout/WideContainer";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useDiscoverMedia } from "@/pages/discover/hooks/useDiscoverMedia";
import { SubPageLayout } from "@/pages/layouts/SubPageLayout";
import { useOverlayStack } from "@/stores/interface/overlayStack";
import { MediaItem } from "@/utils/mediaTypes";

interface ServiceConfig {
  name: string;
  movieProviderId: string;
  tvProviderId: string;
  bg: string;
  letter: string;
  textColor?: string;
  isApple?: boolean;
  image?: string;
}

export const STREAMING_SERVICES: Record<string, ServiceConfig> = {
  netflix: {
    name: "Netflix",
    movieProviderId: "8",
    tvProviderId: "8",
    bg: "#E50914",
    letter: "N",
    image: "/providerimages/netflix.png",
  },
  hulu: {
    name: "Hulu",
    movieProviderId: "15",
    tvProviderId: "15",
    bg: "#1CE783",
    letter: "H",
    textColor: "#000",
    image: "/providerimages/hulu.png",
  },
  disney: {
    name: "Disney+",
    movieProviderId: "337",
    tvProviderId: "337",
    bg: "#113CCF",
    letter: "D+",
    image: "/providerimages/disney.png",
  },
  prime: {
    name: "Prime Video",
    movieProviderId: "10",
    tvProviderId: "10",
    bg: "#00A8E0",
    letter: "P",
    image: "/providerimages/prime.png",
  },
  appletv: {
    name: "Apple TV+",
    movieProviderId: "2",
    tvProviderId: "350",
    bg: "#1C1C1E",
    letter: "",
    isApple: true,
    image: "/providerimages/appletv.png",
  },
  peacock: {
    name: "Peacock",
    movieProviderId: "386",
    tvProviderId: "386",
    bg: "#F2A100",
    letter: "P",
    textColor: "#000",
    image: "/providerimages/peacock.png",
  },
  crunchyroll: {
    name: "Crunchyroll",
    movieProviderId: "283",
    tvProviderId: "283",
    bg: "#F47521",
    letter: "CR",
    image: "/providerimages/crunchyroll.png",
  },
  max: {
    name: "Max",
    movieProviderId: "1899",
    tvProviderId: "1899",
    bg: "#002BE7",
    letter: "M",
  },
  showtime: {
    name: "Showtime",
    movieProviderId: "37",
    tvProviderId: "37",
    bg: "#CC0000",
    letter: "S",
  },
  paramount: {
    name: "Paramount+",
    movieProviderId: "531",
    tvProviderId: "531",
    bg: "#0064FF",
    letter: "P+",
    image: "/providerimages/paramount.png",
  },
};

type Tab = "movie" | "tv";

function ServiceBadge({ service }: { service: ServiceConfig }) {
  return (
    <div
      className="w-12 h-12 overflow-hidden flex items-center justify-center shrink-0"
      style={{ backgroundColor: service.bg, borderRadius: "10px" }}
    >
      {service.image ? (
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span
          className="font-bold text-lg"
          style={{ color: service.textColor ?? "#fff" }}
        >
          {service.letter}
        </span>
      )}
    </div>
  );
}

export function StreamingServicePage() {
  const { service: serviceSlug = "" } = useParams<{ service: string }>();
  const navigate = useNavigate();
  const { showModal } = useOverlayStack();
  const [tab, setTab] = useState<Tab>("movie");
  const [page, setPage] = useState(1);

  const service = STREAMING_SERVICES[serviceSlug];

  const providerId =
    tab === "movie" ? service?.movieProviderId : service?.tvProviderId;

  const { media, isLoading, hasMore } = useDiscoverMedia({
    contentType: "provider",
    mediaType: tab,
    id: providerId,
    providerName: service?.name,
    page,
    enabled: !!service,
  });

  const handleShowDetails = (item: MediaItem) => {
    showModal("details", {
      id: Number(item.id),
      type: item.type === "movie" ? "movie" : "show",
    });
  };

  if (!service) {
    return (
      <SubPageLayout>
        <WideContainer>
          <p className="text-type-secondary mt-8">Service not found.</p>
        </WideContainer>
      </SubPageLayout>
    );
  }

  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    setPage(1);
  };

  return (
    <SubPageLayout>
      <Helmet>
        <title>Watch from {service.name} - T-Stream</title>
      </Helmet>
      <WideContainer>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 mt-4">
          <button type="button" onClick={() => navigate(-1)}>
            <ServiceBadge service={service} />
          </button>
          <h1 className="text-3xl font-bold text-type-emphasis">
            Watch from {service.name}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["movie", "tv"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={[
                "px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                tab === t
                  ? "bg-buttons-toggle text-white"
                  : "bg-mediaCard-hoverBackground text-type-secondary hover:text-type-emphasis",
              ].join(" ")}
            >
              {t === "movie" ? "Movies" : "TV Shows"}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading && page === 1 ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-type-logo border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <MediaGrid>
              {media.map((item) => (
                <MediaCard
                  key={item.id}
                  linkable
                  media={{
                    id: item.id.toString(),
                    title: item.title || item.name || "",
                    year:
                      new Date(
                        item.release_date || item.first_air_date || "",
                      ).getFullYear() || 0,
                    type: tab === "movie" ? "movie" : "show",
                    poster: item.poster_path
                      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                      : undefined,
                  }}
                  onShowDetails={handleShowDetails}
                />
              ))}
            </MediaGrid>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-3 rounded-full bg-buttons-toggle text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </WideContainer>
    </SubPageLayout>
  );
}
