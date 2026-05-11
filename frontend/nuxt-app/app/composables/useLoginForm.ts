import { accessRoleCards, loginRoleConfigByValue } from "~/constants/auth";
import type { LoginRole } from "~/types/auth";

export const useLoginForm = () => {
  const auth = useAuthStore();
  const route = useRoute();
  const router = useRouter();
  const roles = ["manager", "partner", "visitor"] as const;
  const routeRole = computed(() =>
    roles.includes(route.query.role as LoginRole)
      ? (route.query.role as LoginRole)
      : null,
  );

  const selectedRole = ref<LoginRole>(routeRole.value || "manager");
  const form = reactive({
    email: loginRoleConfigByValue[selectedRole.value].email,
    password: loginRoleConfigByValue[selectedRole.value].password,
    remember: false,
  });

  const selectedRoleConfig = computed(
    () => loginRoleConfigByValue[selectedRole.value],
  );

  const isRoleLanding = computed(() => !routeRole.value);

  const selectAccessRole = async (role: LoginRole) => {
    await router.push({ path: "/login", query: { role } });
  };

  const selectRole = (role: LoginRole) => {
    selectedRole.value = role;
    const nextRole = loginRoleConfigByValue[role];

    form.email = nextRole.email;
    form.password = nextRole.password;
    auth.error = "";
  };

  watch(
    routeRole,
    (role) => {
      if (role) {
        selectRole(role);
      }
    },
    { immediate: true },
  );

  const handleLogin = async () => {
    const user = await auth.login(form);

    await router.replace(auth.dashboardPathFor(user));
  };

  return {
    accessRoleCards,
    auth,
    form,
    handleLogin,
    isRoleLanding,
    selectAccessRole,
    selectedRole,
    selectedRoleConfig,
  };
};
