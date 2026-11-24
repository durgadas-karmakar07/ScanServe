import { ArrowRight } from 'lucide-react';

// The welcome at the top of the menu (Design.md, customer hero): the café's cover photo under a
// warm dark wash, its logo, its name in the serif face, its line, and an orange "Explore menu"
// that scrolls to the dishes. Without a cover photo it is a plain night background with the
// café's initial drawn faintly behind.
export default function MenuHero({ restaurant, menuId }) {
  const { name, tagline, coverUrl, logoUrl, isAcceptingOrders } = restaurant;

  return (
    <header className="relative isolate overflow-hidden bg-night text-white">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-20 size-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -bottom-20 -z-20 font-serif text-[20rem] leading-none text-white/[0.04]"
        >
          {name.trim().charAt(0).toUpperCase()}
        </span>
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-night/55 via-night/35 to-night/95" />

      <div className="mx-auto flex min-h-[min(64dvh,560px)] max-w-[1200px] flex-col px-5 pt-5 pb-14 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${name} logo`}
              className="size-14 rounded-full border-2 border-white/80 bg-white object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-full border border-white/40 font-serif text-h2"
            >
              {name.trim().charAt(0).toUpperCase()}
            </span>
          )}
          <p
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-base font-semibold backdrop-blur ${isAcceptingOrders ? 'bg-white/15' : 'bg-danger/80'}`}
          >
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${isAcceptingOrders ? 'bg-[#7bd389]' : 'bg-white/70'}`}
            />
            {isAcceptingOrders ? 'Taking orders' : 'Not taking orders now'}
          </p>
        </div>

        <div className="mt-auto flex max-w-[34rem] flex-col items-start gap-4 pt-16">
          <p className="text-eyebrow font-semibold text-white/75 uppercase">Welcome to</p>
          <h1 className="text-[2.75rem] leading-[1.02] break-words sm:text-[3.5rem]">{name}</h1>
          {tagline && <p className="text-lg break-words text-white/85">{tagline}</p>}
          <a
            href={`#${menuId}`}
            className="mt-2 inline-flex min-h-13 items-center gap-3 rounded-full bg-accent py-1.5 pr-1.5 pl-6 text-lg font-semibold text-white hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Explore menu
            <span className="flex size-10 items-center justify-center rounded-full bg-night">
              <ArrowRight size={22} aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
