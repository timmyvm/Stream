import { useNavigate } from "react-router-dom";

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
    <div>
      <div className="flex items-center justify-between ml-2 md:ml-8 mt-2">
        <div className="flex flex-col pl-2 lg:pl-[68px]">
          <h2 className="text-2xl cursor-default font-bold text-white md:text-2xl pl-0 text-balance">
            Watch from your favourites
          </h2>
        </div>
      </div>
      <div className="relative overflow-hidden carousel-container md:pb-4">
        <div className="grid grid-flow-col auto-cols-max gap-4 pt-0 overflow-x-scroll scrollbar-none rounded-xl overflow-y-hidden md:pl-8 md:pr-8">
          <div className="lg:w-12" />
          {SERVICE_ORDER.map((slug) => {
            const service = STREAMING_SERVICES[slug];
            return (
              <button
                key={slug}
                type="button"
                onClick={() => navigate(`/streaming/${slug}`)}
                className="relative mt-4 flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className="w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] shrink-0 transition-transform duration-200 group-hover:scale-105 group-active:scale-95 overflow-hidden"
                  style={{ borderRadius: "28px" }}
                >
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      loading="lazy"
                      className="w-full h-full object-cover scale-[1.02]"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: service.bg }}
                    >
                      <span
                        className="font-bold text-5xl"
                        style={{ color: service.textColor ?? "#fff" }}
                      >
                        {service.letter}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm text-type-secondary group-hover:text-type-emphasis transition-colors whitespace-nowrap">
                  {service.name}
                </span>
              </button>
            );
          })}
          <div className="lg:w-12" />
        </div>
      </div>
    </div>
  );
}
