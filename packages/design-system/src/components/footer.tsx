export function Footer() {
  return (
    <footer className="mt-16 flex flex-col items-center gap-1 border-t border-white/5 px-6 py-8 text-center">
      <p className="text-sm text-muted-foreground">Made with ❤️ by Mateusz Żak @ 2026</p>
      <p className="text-xs text-muted-foreground/70">
        Game data provided by{" "}
        <a href="https://www.igdb.com" target="_blank" rel="noreferrer" className="underline hover:text-foreground">
          IGDB
        </a>
      </p>
    </footer>
  );
}
