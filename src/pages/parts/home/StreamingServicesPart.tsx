import { useNavigate } from "react-router-dom";

import { Icon, Icons } from "@/components/Icon";
import { STREAMING_SERVICES } from "@/pages/streaming/StreamingServicePage";

const SERVICE_ORDER = [
  "netflix",
  "hulu",
  "disney",
  "prime",
  "appletv",
  "peacock",
  "crunchyroll",
  "max",
  "showtime",
  "paramount",
];

export function StreamingServicesPart() {
  const navigate = useNavigate();

  return (
    <div className="w-full mt-16">
      <div className="flex items-center space-x-2 mb-6">
        <Icon icon={Icons.PLAY} className="text-xl text-type-logo" />
        <h2 className="text-xl font-semibold text-type-emphasis">
          Watch from your favourites
        </h2>
      </div>
      <div className="relative">
        {/* Fade gradient on right edge to hint scrollability */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10 bg-gradient-to-l from-background-main to-transparent" />
        <div className="overflow-x-auto mb-2 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex flex-row gap-3 w-max pr-16">
            {SERVICE_ORDER.map((slug) => {
              const service = STREAMING_SERVICES[slug];
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => navigate(`/streaming/${slug}`)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className="w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] shrink-0 transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
                    style={{ borderRadius: "28px" }}
                  >
                    <div
                      className="w-full h-full overflow-hidden flex items-center justify-center"
                      style={{
                        backgroundColor: service.image
                          ? "transparent"
                          : service.bg,
                        borderRadius: "28px",
                      }}
                    >
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.name}
                          loading="lazy"
                          className="w-full h-full object-cover scale-[1.02]"
                        />
                      ) : (
                        <span
                          className="font-bold text-5xl"
                          style={{ color: service.textColor ?? "#fff" }}
                        >
                          {service.letter}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-type-secondary group-hover:text-type-emphasis transition-colors whitespace-nowrap">
                    {service.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
