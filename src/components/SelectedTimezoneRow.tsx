import { memo, useMemo } from "react";
import { type Timezone } from "~/utils/hooks/use-timezones";
import Clock from "~/components/Clock";
import TimeDials from "./TimeDials";
import { cn } from "~/utils/cn";
import { getDifferenceHoursFromHome } from "~/utils/hooks/use-timezones";
import { useAtom } from "jotai";
import AbbrBadge from "./AbbrBadge";
import {
  homeSelectedTimezonesAtom,
  popSelectedTimezonesAtom,
} from "~/atoms/selected-timezones";
import { Home, Trash2 } from "lucide-react";
import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import { useSearchParams } from "react-router-dom";
import { popTimezoneNameFromUrl } from "~/utils/hooks/use-params";

interface Props {
  timezone: Timezone;
  isHome: boolean;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  index: number;
}

function DiffHoursFromHome({
  diffHoursFromHome,
}: {
  diffHoursFromHome: string;
}) {
  return (
    <span
      className={cn("w-8 text-center text-xs text-red-500", {
        "text-green-500": parseInt(diffHoursFromHome) >= 0,
      })}
    >
      {diffHoursFromHome}
    </span>
  );
}

function Region({ timezone }: { timezone: Timezone }) {
  const [continent, city, country] = timezone.name.replace("_", " ").split("/");

  return (
    <div>
      <p>
        {city}
        <AbbrBadge abbr={timezone.abbr} />
      </p>
      <span className="text-sm primary_text_gray">
        {country ? `${country}, ${continent}` : continent}
      </span>
    </div>
  );
}

function CurrentTime({ timezone }: { timezone: Timezone }) {
  const { dayOfWeek, clock, monthAndDay } = timezone;

  return (
    <div className="text-right">
      <Clock clock={clock} />
      <span className="text-xs primary_text_gray">
        {dayOfWeek + ", " + monthAndDay}
      </span>
    </div>
  );
}

export default memo(function SelectedTimezoneRow({
  timezone,
  isHome,
  provided,
  snapshot,
}: Props) {
  const [homeSelectedTimezone] = useAtom(homeSelectedTimezonesAtom);
  const [searchParams, setSearchParams] = useSearchParams();
  const [, popSelectedTimezones] = useAtom(popSelectedTimezonesAtom);

  const diffHours = useMemo(() => {
    return getDifferenceHoursFromHome(timezone.name, homeSelectedTimezone.name);
  }, [homeSelectedTimezone]);

  timezone.diffHoursFromHome = diffHours;

  function handlePopTimezone() {
    popSelectedTimezones(timezone.name);
    popTimezoneNameFromUrl(timezone.name, [searchParams, setSearchParams]);
  }

  return (
    <div
      className={cn(
        "group relative grid grid-cols-[300px_1fr] gap-2 h-[80px] items-center p-2 pr-4 rounded-md",
        {
          "shadow-md": snapshot.isDragging,
        }
      )}
      ref={provided.innerRef}
      {...provided.draggableProps}
    >
      <button
        type="button"
        className={cn(
          "absolute top-[50%] translate-y-[-50%] -left-8 w-fit h-fit p-1 invisible group-hover:visible z-10"
        )}
        onClick={handlePopTimezone}
      >
        <Trash2 strokeWidth={1} size={20} className="hover:text-red-500" />
      </button>
      <div>
        <div
          className="flex items-center justify-between px-2"
          {...provided.dragHandleProps}
        >
          <div className="flex items-center gap-2">
            {isHome ? (
              <Home size={20} className="w-8" />
            ) : (
              <DiffHoursFromHome
                diffHoursFromHome={timezone.diffHoursFromHome}
              />
            )}
            <Region timezone={timezone} />
          </div>
          <CurrentTime timezone={timezone} />
        </div>
      </div>
      <TimeDials timezone={timezone} />
      <div className={cn(" h-[80px] w-20 absolute top-0 -left-8 ")}>
        {/* hacky way to overcome hovering the gap between parent(relative) and child(absolute) elements */}
      </div>
    </div>
  );
});
