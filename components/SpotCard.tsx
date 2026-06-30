const STATUS_TEXT: Record<string, string> = { good: "text-good", caution: "text-caution", big: "text-big", flat: "text-flat" };
const STATUS_DOT: Record<string, string> = { good: "bg-good", caution: "bg-caution", big: "bg-big", flat: "bg-flat" };

export interface SpotCardProps {
  name: string; zone: string; expert: boolean;
  status: { cls: string; word: string };
  wave: number; period: number; windSpeed: number; windDir: string;
  sst: number | null; window: string;
}

export default function SpotCard(props: SpotCardProps) {
  const { name, zone, expert, status } = props;
  return (
    <article className={`rounded-card border p-4 ${expert ? "border-marea/40 bg-[#103f41]" : "border-line bg-surface"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl uppercase leading-none text-foam">{name}</h3>
          <p className="mt-1 font-mono text-[9.5px] uppercase tracking-wide text-foam-faint">{zone}</p>
          {expert && (
            <span className="mt-2 inline-block rounded bg-coral px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-white">solo expertos</span>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className={`font-display text-lg uppercase ${STATUS_TEXT[status.cls]}`}>{status.word}</span>
          <span className={`h-3 w-3 rounded-full ${STATUS_DOT[status.cls]}`} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 border-t border-dashed border-line pt-3 font-mono">
        <Readout k="ola" v={props.wave.toFixed(1)} u="m" />
        <Readout k="periodo" v={String(Math.round(props.period))} u="s" />
        <Readout k="viento" v={String(props.windSpeed)} u={props.windDir} />
        <Readout k="agua" v={props.sst != null ? String(Math.round(props.sst)) : "—"} u="°" />
      </div>
      <p className="mt-3 font-mono text-[10.5px] text-foam-dim">mejor ventana: <span className="text-coral">{props.window}</span></p>
    </article>
  );
}

function Readout({ k, v, u }: { k: string; v: string; u: string }) {
  return (
    <div>
      <div className="text-[8.5px] uppercase tracking-wide text-foam-faint">{k}</div>
      <div className="mt-0.5 text-[15px] text-foam">{v}<span className="text-[9px] text-foam-faint"> {u}</span></div>
    </div>
  );
}
