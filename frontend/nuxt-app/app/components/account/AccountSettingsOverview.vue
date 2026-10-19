<script setup lang="ts">
import {
  accountOverviewDetailItems,
  type AccountSettingsFormState,
} from "~/constants/accountSettings";
import AppButton from "~/components/common/AppButton.vue";
import type { AccessRoleCard } from "~/types/auth";

const props = defineProps<{
  avatarSrc?: string | null;
  displayEmail: string;
  displayName: string;
  formState: AccountSettingsFormState;
  roleMeta: AccessRoleCard;
  userInitial: string;
}>();

const emit = defineEmits<{
  navigate: [section: "profile" | "security"];
}>();

const { translateText } = useTranslateText();
const getDetailValue = (
  item: (typeof accountOverviewDetailItems)[number],
  formState: AccountSettingsFormState,
  displayEmail: string,
) => {
  if ("value" in item) return item.value;
  if (item.key === "email") return formState.email || displayEmail;

  return formState[item.key];
};

</script>

<template>
  <section class="overview-page">
    <header class="overview-heading">
      <span class="overview-heading-icon"><UIcon name="i-lucide-layout-dashboard" class="size-5" /></span>
      <div>
        <h3>{{ translateText("Overview") }}</h3>
        <p>{{ translateText("A quick view of your account and access level.") }}</p>
      </div>
    </header>

    <div class="overview-grid">
      <div class="overview-main">
        <article class="overview-profile-card">
          <div class="overview-profile-banner">
            <span class="overview-banner-orb overview-banner-orb-one" />
            <span class="overview-banner-orb overview-banner-orb-two" />
            <div class="overview-banner-copy">
              <p>{{ translateText("Dashboard account") }}</p>
              <span>{{ translateText("Personal access and preferences") }}</span>
            </div>
            <UIcon name="i-lucide-sparkles" class="overview-banner-icon size-5" />
          </div>
          <div class="overview-profile-body">
            <span class="overview-avatar-wrap"><UAvatar :src="avatarSrc ?? undefined" :text="userInitial" :alt="displayName" class="overview-avatar" /></span>
            <div class="overview-profile-identity min-w-0">
              <h4>{{ formState.displayName || displayName }}</h4>
              <p class="overview-profile-email">{{ formState.email || displayEmail }}</p>
            </div>
          </div>

          <dl class="overview-details-grid">
            <div v-for="item in accountOverviewDetailItems" :key="item.label" class="overview-detail">
              <dt><UIcon name="i-lucide-mail" class="size-3.5" />{{ translateText(item.label) }}</dt>
              <dd>{{ translateText(getDetailValue(item, formState, displayEmail)) }}</dd>
            </div>
            <div class="overview-detail">
              <dt><UIcon name="i-lucide-shield" class="size-3.5" />{{ translateText("Dashboard role") }}</dt>
              <dd class="overview-role-value"><span><UIcon :name="roleMeta.icon" class="size-4" /></span>{{ translateText(roleMeta.label) }}</dd>
            </div>
          </dl>
        </article>
      </div>

      <aside class="overview-aside">
        <article class="overview-actions-card">
          <div class="overview-card-title"><span><UIcon name="i-lucide-pen-line" class="size-4" /></span></div>
          <p class="overview-action-copy">{{ translateText("Add or update the information that appears across your dashboard.") }}</p>
          <div class="overview-actions">
            <AppButton type="button" color="primary" variant="solid" size="sm" block class="justify-start" icon="i-lucide-user-pen" trailing-icon="i-lucide-arrow-right" :label="String(translateText('Edit profile'))" @click="emit('navigate', 'profile')" />
          </div>
        </article>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.overview-page { display: grid; gap: 24px; padding: 28px; }
.overview-heading { display: flex; align-items: center; gap: 13px; }
.overview-heading-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 12px; background: var(--app-primary-soft); color: var(--app-primary); }
.overview-eyebrow { color: var(--app-primary); font-size: .68rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.overview-profile-label { color: var(--app-primary); font-size: .7rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
.overview-heading h3 { margin: 1px 0 0; color: var(--app-heading); font-size: 1.25rem; font-weight: 750; line-height: 1.2; }
.overview-heading p:last-child { margin-top: 4px; color: var(--app-muted); font-size: .86rem; }
.overview-grid { display: grid; gap: 16px; align-items: start; grid-template-columns: minmax(0, 1.35fr) minmax(270px, .7fr); }
.overview-profile-card, .overview-actions-card { border: 1px solid var(--app-border); border-radius: 13px; background: var(--app-surface); }
.overview-profile-card { overflow: hidden; }.overview-profile-banner { position: relative; display: flex; align-items: flex-start; justify-content: space-between; min-height: 104px; overflow: hidden; padding: 20px 22px; background: linear-gradient(135deg, var(--app-primary), color-mix(in srgb, var(--app-primary) 74%, #342268)); color: var(--app-on-primary); }.overview-banner-orb { position: absolute; border-radius: 50%; background: color-mix(in srgb, white 18%, transparent); }.overview-banner-orb-one { width: 148px; height: 148px; right: -38px; top: -72px; }.overview-banner-orb-two { width: 72px; height: 72px; right: 74px; bottom: -45px; }.overview-banner-copy { position: relative; z-index: 1; }.overview-banner-copy p { font-size: .82rem; font-weight: 750; }.overview-banner-copy span { display: block; margin-top: 4px; font-size: .72rem; opacity: .74; }.overview-banner-icon { position: relative; z-index: 1; opacity: .78; }
.overview-profile-body { display: flex; align-items: center; gap: 13px; margin-top: -23px; padding: 0 22px 19px; }.overview-avatar-wrap { position: relative; z-index: 1; display: grid; width: 66px; height: 66px; flex: none; place-items: center; border: 4px solid var(--app-surface); border-radius: 50%; background: var(--app-surface); box-shadow: 0 7px 20px color-mix(in srgb, var(--app-heading) 17%, transparent); }.overview-avatar { width: 56px; height: 56px; }.overview-profile-identity { padding-top: 23px; }.overview-profile-body h4 { overflow: hidden; margin: 2px 0 0; color: var(--app-heading); font-size: 1.05rem; font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
.overview-profile-email { overflow: hidden; margin-top: 3px; color: var(--app-muted); font-size: .78rem; text-overflow: ellipsis; white-space: nowrap; }
.overview-role-chip { display: inline-flex; align-items: center; gap: 6px; margin-left: auto; padding: 7px 9px; border-radius: 999px; background: var(--app-primary-soft); color: var(--app-primary); font-size: .7rem; font-weight: 750; }
.overview-details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.overview-detail { min-width: 0; padding: 16px 20px; border-top: 1px solid var(--app-border); }
.overview-detail:nth-child(odd) { border-right: 1px solid var(--app-border); }
.overview-detail dt { display: flex; align-items: center; gap: 5px; color: var(--app-muted); font-size: .7rem; font-weight: 650; }
.overview-detail dd { overflow: hidden; margin-top: 5px; color: var(--app-heading); font-size: .82rem; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.overview-role-value { display: flex; align-items: center; gap: 7px; }.overview-role-value span { display: grid; width: 23px; height: 23px; flex: none; place-items: center; border-radius: 6px; background: var(--app-primary-soft); color: var(--app-primary); }
.overview-aside { display: grid; gap: 16px; }.overview-actions-card { padding: 20px; }.overview-card-title { display: flex; gap: 9px; }.overview-card-title > span { display: grid; width: 31px; height: 31px; flex: none; place-items: center; border-radius: 9px; background: var(--app-primary-soft); color: var(--app-primary); }
.overview-card-title h4 { margin-top: 1px; color: var(--app-heading); font-size: .9rem; font-weight: 750; }.overview-card-title p { color: var(--app-primary); font-size: .67rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }.overview-action-copy { position: relative; margin-top: 15px; color: var(--app-muted); font-size: .77rem; line-height: 1.55; }
.overview-actions { display: grid; gap: 8px; margin-top: 16px; }
@media (max-width: 920px) { .overview-grid { grid-template-columns: 1fr; }.overview-aside { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 580px) { .overview-page { padding: 20px; }.overview-profile-banner { padding: 18px; }.overview-profile-body { padding: 0 18px 17px; }.overview-role-chip { display: none; }.overview-details-grid, .overview-aside { grid-template-columns: 1fr; }.overview-detail:nth-child(odd) { border-right: 0; } }
</style>
