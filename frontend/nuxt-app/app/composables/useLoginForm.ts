import { loginRoleConfigByValue, loginRoles } from "~/constants/auth";
import type { LoginRole } from "~/types/auth";

export const useLoginForm = () => {
  const auth = useAuthStore();
  const router = useRouter();

  const selectedRole = ref<LoginRole>("manager");
  const form = reactive({
    email: loginRoleConfigByValue.manager.email,
    password: loginRoleConfigByValue.manager.password,
  });

  const selectedRoleConfig = computed(
    () => loginRoleConfigByValue[selectedRole.value],
  );

  const selectRole = (role: LoginRole) => {
    selectedRole.value = role;
    const nextRole = loginRoleConfigByValue[role];

    form.email = nextRole.email;
    form.password = nextRole.password;
    auth.error = "";
  };

  const handleLogin = async () => {
    const user = await auth.login(form);

    await router.replace(auth.dashboardPathFor(user));
  };

  return {
    auth,
    form,
    handleLogin,
    roles: loginRoles,
    selectedRole,
    selectedRoleConfig,
    selectRole,
  };
};
