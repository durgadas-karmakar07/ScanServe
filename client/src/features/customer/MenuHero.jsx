// The menu board: the café's cover photo washed in chalkboard green, its logo and its name.
// Without a cover photo it is a plain chalkboard with the café's initial drawn faintly behind.
export default function MenuHero({ restaurant }) {
  const { name, tagline, coverUrl, logoUrl, isAcceptingOrders } = restaurant;

  return (
    <header className="relative isolate overflow-hidden bg-primary text-white">
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
          className="pointer-events-none absolute -right-4 -bottom-24 -z-20 font-display text-[18rem] leading-none font-bold text-white/5"
        >
          {name.trim().charAt(0).toUpperCase()}
        </span>
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-primary via-primary/80 to-primary/30" />

      <div className="mx-auto flex min-h-[280px] max-w-[1200px] flex-col justify-end gap-3 px-4 pt-14 pb-7 sm:min-h-[340px]">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="size-20 rounded-full border-4 border-white bg-white object-cover shadow-md"
          />
        )}
        <h1 className="text-display font-bold text-balance break-words">{name}</h1>
        {tagline && <p className="max-w-[60ch] text-lg break-words text-white/90">{tagline}</p>}
        <p
          className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-1 text-base font-semibold ${isAcceptingOrders ? 'bg-success text-white' : 'bg-white/15 text-white'}`}
        >
          <span
            aria-hidden="true"
            className={`size-2.5 rounded-full ${isAcceptingOrders ? 'bg-white' : 'bg-white/60'}`}
          />
          {isAcceptingOrders ? 'Taking orders' : 'Not taking orders right now'}
        </p>
      </div>
    </header>
  );
}
