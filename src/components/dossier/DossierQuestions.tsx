interface DossierQuestionsProps {
  questions: { role: string; texto: string }[];
}

export function DossierQuestions({ questions }: DossierQuestionsProps) {
  return (
    <div className="flex flex-col gap-3">
      {questions.map((p, i) => (
        <div key={i} className="flex gap-2.5 items-start">
          <span className="shrink-0 px-2 py-0.5 rounded-md bg-accent-soft text-accent text-[10px] font-bold uppercase tracking-wider mt-0.5">
            {p.role}
          </span>
          <p className="text-text-secondary text-sm leading-relaxed">
            {p.texto}
          </p>
        </div>
      ))}
    </div>
  );
}
