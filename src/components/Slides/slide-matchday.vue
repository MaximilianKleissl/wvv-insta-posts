<script setup lang="ts">
import { computed } from "vue";
import type { SeasonData, MatchDay, LogoLibrary } from "@/lib/types";
import { sortMatches, isTournamentMatchDay } from "@/lib/grouping";
import { MapPin, Calendar, Clock, Users } from "lucide-vue-next";
import SharedContainer from "./sharedContainer.vue";
import { useSlideDensity } from "@/composables/Slides/useDensity.ts";
import VsBadge from "@/components/Slides/subComponents/VsBadge.vue";
import Cell from "@/components/Slides/subComponents/Cell.vue";
import TeamLogo from "@/components/Slides/subComponents/TeamLogo.vue";
import { useLogo } from "@/composables/useLogo";
import { useTeamHighlight } from "@/composables/useTeamHighlight";
import type { SlideTitle, MatchDayMetaData } from "@/lib/slide-types";

interface SlideMatchdayProps {
  id: string;
  season: SeasonData;
  matchDay: MatchDay;
  logoLibrary: LogoLibrary;
}

const props = defineProps<SlideMatchdayProps>();

// Composables
const { getLogoUrl } = useLogo(import.meta.env.BASE_URL, props.logoLibrary);
const { getTeamTextColor } = useTeamHighlight(props.season);
const { styles } = useSlideDensity(
  computed(() => {
    const tournament = isTournamentMatchDay(props.matchDay);
    const teams = props.matchDay.teams ?? [];
    const matches = sortMatches(props.matchDay);
    return tournament ? teams.length : matches.length;
  }),
);

// Computed properties
const tournament = computed(() => isTournamentMatchDay(props.matchDay));
const matches = computed(() => sortMatches(props.matchDay));
const teams = computed(() => props.matchDay.teams ?? []);

const slideTitle = computed<SlideTitle>(() => ({
  subtitle: props.matchDay.team,
  title: `${props.matchDay.home ? "Heim" : "Auswärts"}-Spieltag`,
  label: props.matchDay.match_day_name ?? props.matchDay.date,
}));

const matchDayMeta = computed<MatchDayMetaData>(() => ({
  date: props.matchDay.date,
  location: props.matchDay.location,
}));
</script>

<template>
  <SharedContainer
    :id="id"
    :styles="styles"
    :slideTitle="slideTitle"
    :matchDay="matchDayMeta"
  >
    <template v-if="tournament">
      <div
        class="flex items-center gap-3 text-2xl font-bold text-muted-green-800/80 mb-2"
      >
        <Users class="w-7 h-7 text-green-800" />
        <span>Teilnehmende Mannschaften</span>
      </div>
      <div class="grid grid-cols-2 gap-4 content-start flex-1 overflow-hidden">
        <Cell v-for="(team, idx) in teams" :key="idx" :styles="styles">
          <TeamLogo
            :team-name="team"
            :size-class="styles.logoSize"
            :custom-library="props.logoLibrary"
          />
          <span
            :class="[
              styles.textSize,
              'font-extrabold leading-snug truncate',
              getTeamTextColor(team),
            ]"
          >
            {{ team }}
          </span>
        </Cell>
      </div>
    </template>

    <template v-else>
      <Cell :styles="styles" v-for="(m, idx) in matches" :key="idx">
        <div
          class="flex flex-col items-center justify-center px-4 border-r border-green-800/60 min-w-[130px]"
        >
          <Clock class="w-6 h-6 text-green-800 mb-1 shrink-0" />
          <span
            :class="[
              styles.clockSize,
              'font-black text-green-800 tracking-tighter',
            ]"
            >{{ m.time }}</span
          >
          <span
            class="text-lg font-bold text-green-800 text-muted uppercase tracking-wider mt-0.5"
            >Uhr</span
          >
        </div>

        <div class="flex-1 flex items-center justify-between gap-4 px-2">
          <div
            class="flex-1 flex flex-col items-center text-center gap-2 min-w-0"
          >
            <TeamLogo
              :team-name="m.home"
              :size-class="styles.logoSize"
              :custom-library="props.logoLibrary"
            />
            <span
              :class="[
                styles.textSize,
                'font-black leading-tight truncate w-full',
                getTeamTextColor(m.home),
              ]"
            >
              {{ m.home }}
            </span>
          </div>

          <VsBadge />

          <div
            class="flex-1 flex flex-col items-center text-center gap-2 min-w-0"
          >
            <TeamLogo
              :team-name="m.away"
              :size-class="styles.logoSize"
              :custom-library="props.logoLibrary"
            />
            <span
              :class="[
                styles.textSize,
                'font-black leading-tight truncate w-full',
                getTeamTextColor(m.away),
              ]"
            >
              {{ m.away }}
            </span>
          </div>
        </div>
      </Cell>
    </template>
  </SharedContainer>
</template>
