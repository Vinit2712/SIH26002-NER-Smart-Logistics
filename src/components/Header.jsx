function Header() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h2 className="text-sm font-semibold text-slate-700">
        Smart Logistics & Accessibility Intelligence Platform
      </h2>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        Live · North Eastern Region
      </div>
    </header>
  );
}

export default Header;