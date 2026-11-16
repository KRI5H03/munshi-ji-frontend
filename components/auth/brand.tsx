export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex size-12 items-center justify-center rounded-lg bg-primary text-xl font-bold text-primary-foreground"
      >
        म
      </span>
      <div>
        <p className="text-2xl leading-tight font-bold">Munshi Ji</p>
        <p className="text-muted-foreground">Billing for your shop</p>
      </div>
    </div>
  );
}
