"use client";

const Header = () => {
  return (
    <div className="sticky top-0 z-50 border-b border-[var(--app-panel-border)] bg-[rgba(8,12,22,0.86)] backdrop-blur-md">
      <header className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-4 lg:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--app-text-dim)]">
            Institutional Credit Monitoring
          </p>
          <h1 className="text-xl font-semibold text-[var(--app-text)] lg:text-2xl">
            Vault Risk Dashboard
          </h1>
        </div>
      </header>
    </div>
  );
};

export default Header;
