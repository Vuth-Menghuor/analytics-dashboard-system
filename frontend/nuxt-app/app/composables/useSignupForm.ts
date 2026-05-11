import { stateProvinceOptions, schoolInstituteOptions } from "~/constants/auth";
import type { RegistrationRole } from "~/types/auth";

export const useSignupForm = () => {
  const auth = useAuthStore();
  const route = useRoute();
  const router = useRouter();
  const routeRole =
    route.query.role === "partner" || route.query.role === "visitor"
      ? route.query.role
      : "visitor";

  const selectedRole = ref<RegistrationRole>(routeRole);
  const currentStep = ref(1);
  const submitStatus = ref("");
  const idCardPreviewUrl = ref("");

  const form = reactive({
    stateProvince: "",
    fullName: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    institutionName: "",
    idCard: null as File | null,
  });

  const isPartner = computed(() => selectedRole.value === "partner");
  const totalSteps = computed(() => (isPartner.value ? 4 : 1));
  const isPartnerReviewStep = computed(
    () => isPartner.value && currentStep.value === 4,
  );

  const primaryButtonLabel = computed(() => {
    if (isPartner.value && currentStep.value < totalSteps.value) {
      return "Next";
    }

    return isPartner.value ? "Submit for Review" : "Create Account";
  });

  const headerTitle = computed(() => {
    if (!isPartner.value) {
      return "Create Visitor Account";
    }

    return [
      "Choose State / Province",
      "Basic Information",
      "School / Institute Information",
      "Review & Submit",
    ][currentStep.value - 1];
  });

  const headerCopy = computed(() =>
    isPartner.value
      ? "Request partner access for manager approval."
      : "Create a public visitor account and continue to the dashboard.",
  );

  const reviewItems = computed(() => [
    { label: "State / Province", value: form.stateProvince },
    { label: "Name", value: `${form.firstName} ${form.lastName}`.trim() },
    { label: "Email", value: form.email },
    { label: "Phone Number", value: form.phoneNumber },
    { label: "School / Institute", value: form.institutionName },
  ]);

  const idCardPreviewType = computed(() => {
    if (!form.idCard) {
      return null;
    }

    return form.idCard.type.startsWith("image/") ? "image" : "document";
  });

  const actionModeItems = computed(() =>
    selectedRole.value === "partner"
      ? [
          { label: "I already have an account", to: "/login?role=partner" },
          { label: "Create Partner Account", to: "/signup?role=partner" },
        ]
      : [
          { label: "Already have account", to: "/login?role=visitor" },
          { label: "Create Account", to: "/signup?role=visitor" },
        ],
  );

  const goToPreviousStep = () => {
    currentStep.value = Math.max(1, currentStep.value - 1);
    submitStatus.value = "";
  };

  const updateIdCardFile = (fileList: FileList | null) => {
    if (idCardPreviewUrl.value) {
      URL.revokeObjectURL(idCardPreviewUrl.value);
      idCardPreviewUrl.value = "";
    }

    form.idCard = fileList?.item(0) ?? null;

    if (form.idCard) {
      idCardPreviewUrl.value = URL.createObjectURL(form.idCard);
    }
  };

  const handlePrimaryAction = async () => {
    submitStatus.value = "";

    if (isPartner.value && currentStep.value < totalSteps.value) {
      currentStep.value += 1;
      return;
    }

    if (selectedRole.value === "visitor") {
      submitStatus.value = "Account created successfully.";
      auth.createVisitorSession(form.fullName || "Visitor User", form.email);
      await router.push("/visitor/dashboard");
      return;
    }

    submitStatus.value = "Your account is under review by Manager.";
  };

  return {
    actionModeItems,
    currentStep,
    form,
    goToPreviousStep,
    handlePrimaryAction,
    headerCopy,
    headerTitle,
    idCardPreviewType,
    idCardPreviewUrl,
    schoolInstitutes: schoolInstituteOptions,
    isPartner,
    isPartnerReviewStep,
    primaryButtonLabel,
    reviewItems,
    selectedRole,
    stateProvinces: stateProvinceOptions,
    submitStatus,
    totalSteps,
    updateIdCardFile,
  };
};
