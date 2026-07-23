interface DossierDishesProps {
  dishes: { name: string; why: string }[];
}

export function DossierDishes({ dishes }: DossierDishesProps) {
  return (
    <div className="flex flex-col gap-3">
      {dishes.map((p, i) => (
        <div
          key={i}
          className="rounded-xl bg-bg-elevated border border-border-subtle p-3.5 border-l-2 border-l-accent"
        >
          <p className="font-editorial text-[15px] tracking-tight text-text-primary">
            {p.name}
          </p>
          <p className="text-text-muted text-xs mt-1 leading-relaxed">
            {p.why}
          </p>
        </div>
      ))}
    </div>
  );
}
