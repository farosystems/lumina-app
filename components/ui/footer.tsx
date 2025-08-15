export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Creado por{" "}
            <span className="font-semibold text-primary">ImpulseAgency</span>
          </p>
        </div>
        <div className="text-center text-sm text-muted-foreground md:text-left">
          © 2025 ImpulseAgency. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}

