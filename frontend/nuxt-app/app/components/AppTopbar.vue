<script setup lang="ts">
const auth = useAuthStore()

const handleLogout = async () => {
  await auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <header class="topbar">
    <div class="search-box">
      <IconByName name="Search" />
      <input aria-label="Search dashboard" placeholder="Search analytics, users, reports" />
    </div>
    <div class="toolbar">
      <button class="btn icon" aria-label="Notifications" title="Notifications">
        <IconByName name="Bell" />
      </button>
      <NuxtLink v-if="auth.user" class="user-chip" to="/profile">
        <span>{{ auth.user.name.charAt(0) }}</span>
        <strong>{{ auth.user.name }}</strong>
      </NuxtLink>
      <button class="btn icon" type="button" aria-label="Sign out" title="Sign out" @click="handleLogout">
        <IconByName name="LogOut" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.search-box {
  display: flex;
  min-height: 44px;
  width: min(520px, 100%);
  align-items: center;
  gap: 10px;
  border: 1px solid #d8e0ec;
  border-radius: 8px;
  padding: 0 12px;
  background: #fff;
  color: #64748b;
}

.search-box input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
}

.user-chip {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  gap: 10px;
  border: 1px solid #d8e0ec;
  border-radius: 8px;
  padding: 6px 12px 6px 7px;
  background: #fff;
}

.user-chip span {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: #14b8a6;
  color: #fff;
  font-weight: 900;
}

@media (max-width: 680px) {
  .topbar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
