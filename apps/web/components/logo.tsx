export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-secondary to-accent text-white font-bold shadow-lg">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 3C5.9 3 5 3.9 5 5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V5C19 3.9 18.1 3 17 3H7Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M9 7H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M9 10H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M9 13H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="14" cy="16" r="2" fill="currentColor"/>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold leading-none text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          CertFyi
        </span>
        <span className="text-xs text-muted-foreground">
          Web3 Verified
        </span>
      </div>
    </div>
  )
}
