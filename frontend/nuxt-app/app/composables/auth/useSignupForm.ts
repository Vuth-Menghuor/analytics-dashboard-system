import { AxiosError } from "axios";
import { stateProvinceOptions, schoolInstituteOptions } from "~/constants/auth";
import { submitPartnerRequest } from "~/services/admin.service";
import type { RegistrationRole } from "~/types/auth";

type ValidationErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

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
  const isSubmitting = ref(false);
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

  const getSubmitErrorMessage = (err: unknown) => {
    if (err instanceof AxiosError) {
      const response = err.response?.data as ValidationErrorResponse | undefined;
      const firstFieldError = response?.errors
        ? Object.values(response.errors)[0]?.[0]
        : undefined;

      return (
        firstFieldError ||
        response?.message ||
        "Unable to submit partner request. Please check your details."
      );
    }

    return "Unable to submit partner request. Please try again.";
  };

  const handlePrimaryAction = async () => {
    submitStatus.value = "";

    if (isPartner.value && currentStep.value < totalSteps.value) {
      currentStep.value += 1;
      return;
    }

    if (selectedRole.value === "visitor") {
      if (form.password !== form.confirmPassword) {
        submitStatus.value = "Passwords do not match.";
        return;
      }

      await auth.registerVisitor({
        name: form.fullName || `${form.firstName} ${form.lastName}`.trim() || "Visitor User",
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
      });

      submitStatus.value = "Account created successfully.";
      await router.push("/visitor/dashboard");
      return;
    }

    if (form.password !== form.confirmPassword) {
      submitStatus.value = "Passwords do not match.";
      return;
    }

    if (!form.idCard) {
      submitStatus.value = "Please upload your institute affiliation document.";
      return;
    }

    isSubmitting.value = true;

    try {
      await submitPartnerRequest({
        stateProvince: form.stateProvince,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        institutionName: form.institutionName,
        idCard: form.idCard,
        password: form.password,
        passwordConfirmation: form.confirmPassword,
      });

      submitStatus.value = "Your partner request was submitted for Manager review.";
    } catch (err) {
      submitStatus.value = getSubmitErrorMessage(err);
    } finally {
      isSubmitting.value = false;
    }
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
    isSubmitting,
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
