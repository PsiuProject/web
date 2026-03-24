<template>
  <g 
    class="connection-group"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Invisible wider line for easier hover detection -->
    <path
      :d="pathData"
      stroke="transparent"
      stroke-width="24"
      fill="none"
      style="cursor: pointer;"
    />
    
    <!-- Background glow line (always visible, low opacity) -->
    <path
      :d="pathData"
      :stroke="lineColor"
      stroke-width="6"
      fill="none"
      :opacity="0.08"
      class="connection-glow"
    />
    
    <!-- Animated dotted line - lower opacity by default -->
    <path
      :d="pathData"
      :stroke="lineColor"
      stroke-width="1.5"
      stroke-dasharray="6 10"
      fill="none"
      :opacity="isHovered ? 0.7 : 0.25"
      class="connection-line"
      :class="{ 'connection-line-animated': !isHovered }"
    />
    
    <!-- Secondary slower animation layer -->
    <path
      :d="pathData"
      :stroke="lineColor"
      stroke-width="1"
      stroke-dasharray="3 17"
      fill="none"
      :opacity="isHovered ? 0.5 : 0.15"
      class="connection-line-slow"
      :class="{ 'connection-line-animated-slow': !isHovered }"
    />
    
    <!-- Connection dots at endpoints -->
    <circle
      :cx="x1"
      :cy="y1"
      r="4"
      :fill="lineColor"
      :opacity="isHovered ? 0.9 : 0.35"
      class="connection-dot"
    />
    <circle
      :cx="x2"
      :cy="y2"
      r="4"
      :fill="lineColor"
      :opacity="isHovered ? 0.9 : 0.35"
      class="connection-dot"
    />
    
    <!-- Animated dot traveling along path -->
    <circle
      v-if="isHovered"
      r="3"
      :fill="lineColor"
      :opacity="0.8"
      class="connection-traveler"
    >
      <animateMotion 
        :path="pathData" 
        dur="3s" 
        repeatCount="indefinite"
        fill="freeze"
      />
    </circle>
    
    <!-- Tooltip on hover -->
    <g v-if="isHovered && connectionTypeKey" class="connection-tooltip">
      <rect
        :x="tooltipX"
        :y="tooltipY - 12"
        :width="tooltipWidth"
        height="24"
        fill="#0d0d0d"
        :stroke="lineColor"
        stroke-width="1"
        rx="4"
        :opacity="0.9"
      />
      <text
        :x="tooltipX + tooltipWidth / 2"
        :y="tooltipY + 4"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#e2ded0"
        font-size="11"
        font-family="'Space Mono', monospace"
        style="pointer-events: none; letter-spacing: 0.05vw;"
      >
        {{ t(connectionTypeKey) }}
      </text>
    </g>
  </g>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  x1: { type: Number, required: true },
  y1: { type: Number, required: true },
  x2: { type: Number, required: true },
  y2: { type: Number, required: true },
  connectionTypeKey: { type: String, default: 'connections.subProject' },
  color: { type: String, default: '#b55d3a' }
})

const isHovered = ref(false)

// Improved path calculation with smooth curves
const pathData = computed(() => {
  const dx = props.x2 - props.x1
  const dy = props.y2 - props.y1
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // Control point offset based on distance (smoother for longer paths)
  const offsetFactor = Math.min(0.5, 300 / Math.max(distance, 100))
  const controlOffset = Math.abs(dy) * offsetFactor + Math.abs(dx) * 0.15
  
  // Cubic bezier for smoother S-curve
  const midX = (props.x1 + props.x2) / 2
  const midY = (props.y1 + props.y2) / 2
  
  // Additional control points for more natural curves
  const cx1 = props.x1 + (dx * 0.25)
  const cy1 = props.y1 + controlOffset
  const cx2 = props.x1 + (dx * 0.75)
  const cy2 = props.y2 - controlOffset
  
  return `M ${props.x1} ${props.y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${props.x2} ${props.y2}`
})

// Midpoint for tooltip
const midX = computed(() => (props.x1 + props.x2) / 2)
const midY = computed(() => (props.y1 + props.y2) / 2)

// Tooltip position - offset to not cover the line
const tooltipX = computed(() => {
  const dx = props.x2 - props.x1
  return dx > 0 ? midX.value - 40 : midX.value + 40
})
const tooltipY = computed(() => midX.value)

// Dynamic tooltip width based on text length
const tooltipWidth = computed(() => {
  const type = props.connectionTypeKey || ''
  return Math.max(100, type.length * 8 + 24)
})

const lineColor = computed(() => props.color)
</script>

<style scoped>
.connection-group {
  pointer-events: auto;
}

.connection-line {
  transition: opacity 0.3s ease, stroke-width 0.2s ease;
}

.connection-line-animated {
  animation: dashMove 15s linear infinite;
}

.connection-line-slow {
  transition: opacity 0.3s ease;
}

.connection-line-animated-slow {
  animation: dashMoveSlow 25s linear infinite;
}

.connection-glow {
  transition: opacity 0.3s ease;
}

.connection-dot {
  transition: opacity 0.3s ease, r 0.2s ease;
}

.connection-traveler {
  filter: drop-shadow(0 0 0.21vw currentColor);
}

.connection-group:hover .connection-line {
  stroke-width: 2;
}

.connection-group:hover .connection-glow {
  opacity: 0.15;
}

.connection-group:hover .connection-dot {
  r: 5;
}

.connection-tooltip {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-0.16vh);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes dashMove {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: 160;
  }
}

@keyframes dashMoveSlow {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: -200;
  }
}
</style>
