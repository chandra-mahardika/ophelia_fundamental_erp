<script lang="ts">
  const paths: Record<string, string[]> = {
    box: ["M21 8l-9-5-9 5v8l9 5 9-5V8z", "M3 8l9 5 9-5", "M12 13v8"],
    cart: [
      "M3 4h2l2.4 12.2A1 1 0 0 0 8.4 17H18a1 1 0 0 0 1-.8L21 8H6",
      "M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
      "M18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
    ],
    ledger: [
      "M5 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5z",
      "M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2",
      "M9 8h6",
      "M9 12h6",
      "M9 16h4",
    ],
    users: [
      "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1",
      "M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
      "M21 19v-1a4 4 0 0 0-3-3.87",
      "M15 3.13a3.5 3.5 0 0 1 0 6.74",
    ],
    grid: ["M4 4h7v7H4z", "M13 4h7v7h-7z", "M4 13h7v7H4z", "M13 13h7v7h-7z"],
    building: [
      "M4 21V7l8-4 8 4v14",
      "M4 21h16",
      "M9 21v-4h6v4",
      "M8 10h.01",
      "M12 10h.01",
      "M16 10h.01",
      "M8 14h.01",
      "M12 14h.01",
      "M16 14h.01",
    ],
    gear: [
      "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
      "M19.4 13a7.5 7.5 0 0 0 0-2l2-1.5-2-3.5-2.3 1a7.5 7.5 0 0 0-1.7-1L15 3h-6l-.4 2.5a7.5 7.5 0 0 0-1.7 1l-2.3-1-2 3.5L4.6 11a7.5 7.5 0 0 0 0 2l-2 1.5 2 3.5 2.3-1a7.5 7.5 0 0 0 1.7 1L9 21h6l.4-2.5a7.5 7.5 0 0 0 1.7-1l2.3 1 2-3.5z",
    ],
    bell: ["M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9z", "M10 20a2.2 2.2 0 0 0 4 0"],
    eye: [
      "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z",
      "M10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    ],
    eyeOff: [
      "M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68",
      "M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 8 10 8a9.74 9.74 0 0 0 5.39-1.61",
      "M2 2l20 20",
      "M9.88 9.88a3 3 0 1 0 4.24 4.24",
    ],
    back: ["M19 12H5", "M11 18l-6-6 6-6"],
  };

  let { name = "grid", size = 48, cls = "" }: { name?: string; size?: number; cls?: string } =
    $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.6"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={cls}
  aria-hidden="true"
>
  {#each paths[name] ?? paths.grid as d}
    <path {d} />
  {/each}
</svg>
