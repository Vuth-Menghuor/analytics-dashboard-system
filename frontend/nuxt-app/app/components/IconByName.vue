<script setup lang="ts">
import {
  Bell,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  DollarSign,
  Download,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  TrendingUp,
  UserCircle,
  Users
} from 'lucide-vue-next'

const props = defineProps<{
  name: string
  size?: number
}>()

const icons = {
  Bell,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  DollarSign,
  Download,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  TrendingUp,
  UserCircle,
  Users
}

const icon = computed(() => icons[props.name as keyof typeof icons] ?? CircleHelp)
</script>

<template>
  <component :is="icon" :size="size ?? 18" stroke-width="2" aria-hidden="true" />
</template>
