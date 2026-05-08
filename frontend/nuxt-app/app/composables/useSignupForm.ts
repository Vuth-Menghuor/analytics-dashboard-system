import {
  partnerDepartments,
  partnerInstitutes,
  partnerPositions,
  registrationRoles,
} from "~/constants/auth";
import type { RegistrationRole } from "~/types/auth";

export const useSignupForm = () => {
  const router = useRouter();

  const selectedRole = ref<RegistrationRole>("visitor");
  const currentStep = ref(1);
  const submitStatus = ref("");

  const form = reactive({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    institute: "",
    department: "",
    position: "",
    message: "",
  });

  const isPartnerStepTwo = computed(
    () => selectedRole.value === "partner" && currentStep.value === 2,
  );

  const primaryButtonLabel = computed(() => {
    if (selectedRole.value === "partner" && currentStep.value === 1) {
      return "Next";
    }

    return selectedRole.value === "visitor" ? "Create Account" : "Submit";
  });

  const selectRole = (role: RegistrationRole) => {
    selectedRole.value = role;
    currentStep.value = 1;
    submitStatus.value = "";
  };

  const goToPreviousStep = () => {
    currentStep.value = 1;
    submitStatus.value = "";
  };

  const handlePrimaryAction = async () => {
    submitStatus.value = "";

    if (selectedRole.value === "partner" && currentStep.value === 1) {
      currentStep.value = 2;
      return;
    }

    if (selectedRole.value === "visitor") {
      submitStatus.value = "Visitor account created. Redirecting to login.";
      await router.push("/login");
      return;
    }

    submitStatus.value =
      "Partner request submitted and pending manager approval.";
  };

  return {
    currentStep,
    departments: partnerDepartments,
    form,
    goToPreviousStep,
    handlePrimaryAction,
    institutes: partnerInstitutes,
    isPartnerStepTwo,
    positions: partnerPositions,
    primaryButtonLabel,
    roles: registrationRoles,
    selectedRole,
    selectRole,
    submitStatus,
  };
};
