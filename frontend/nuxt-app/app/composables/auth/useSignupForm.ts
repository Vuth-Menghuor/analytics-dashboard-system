import { AxiosError } from "axios";
import { stateProvinceOptions, schoolInstituteOptions } from "~/constants/auth";
import { submitPartnerRequest } from "~/services/admin.service";
import {
  decodeGoogleJwtPayload,
  loadGoogleIdentityScript,
  type GoogleCredentialResponse,
} from "~/utils/googleIdentity";

type ValidationErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export const useSignupForm = () => {
  const auth = useAuthStore();
  const router = useRouter();
  const route = useRoute();
  const runtimeConfig = useRuntimeConfig();

  const selectedRole = ref<"partner" | "visitor">(
    route.query.role === "visitor" ? "visitor" : "partner",
  );
  const currentStep = ref(1);
  const submitStatus = ref("");
  const submitStatusType = ref<"success" | "error">("success");
  const isSubmitting = ref(false);
  const googleButtonRef = ref<HTMLElement | null>(null);
  const googleIdToken = ref("");
  const verifiedGoogleEmail = ref("");
  const isRenderingGoogleButton = ref(false);

  const form = reactive({
    stateProvince: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    institutionName: "",
  });

  const isPartner = computed(() => selectedRole.value === "partner");
  const isVisitor = computed(() => selectedRole.value === "visitor");
  const totalSteps = computed(() => (isPartner.value ? 2 : 1));
  const googleClientId = computed(
    () => String(runtimeConfig.public.googleClientId || ""),
  );
  const isGoogleEmailVerified = computed(
    () =>
      verifiedGoogleEmail.value !== "" &&
      verifiedGoogleEmail.value.toLowerCase() === form.email.toLowerCase(),
  );

  const primaryButtonLabel = computed(() => {
    if (isVisitor.value) {
      return "Create Visitor Account";
    }

    if (currentStep.value < totalSteps.value) {
      return "Next";
    }

    return "Submit Request";
  });

  const headerTitle = computed(() => {
    if (isVisitor.value) {
      return "Create Visitor Account";
    }

    return [
      "Institute Information",
      "Account Information",
    ][currentStep.value - 1];
  });

  const headerCopy = computed(() =>
    isVisitor.value
      ? "Use a verified Google account to create visitor access."
      : "Request partner access with your institute profile.",
  );

  const actionModeItems = computed(() => [
    {
      label: "I already have an account",
      to: `/login?role=${selectedRole.value}`,
    },
    {
      label: isVisitor.value ? "Create Visitor Account" : "Create Partner Account",
      to: `/signup?role=${selectedRole.value}`,
    },
  ]);

  const goToPreviousStep = () => {
    currentStep.value = Math.max(1, currentStep.value - 1);
    submitStatus.value = "";
  };

  const setGoogleVerificationError = (message: string) => {
    submitStatus.value = message;
    submitStatusType.value = "error";
  };

  const clearGoogleVerification = () => {
    googleIdToken.value = "";
    verifiedGoogleEmail.value = "";
  };

  const handleGoogleCredential = (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      setGoogleVerificationError("Unable to verify Google account.");
      return;
    }

    try {
      const payload = decodeGoogleJwtPayload(response.credential);
      const email = String(payload.email || "");
      const emailVerified = payload.email_verified === true || payload.email_verified === "true";

      if (!email || !emailVerified) {
        setGoogleVerificationError("Please choose a verified Google account.");
        return;
      }

      googleIdToken.value = response.credential;
      verifiedGoogleEmail.value = email;
      form.email = email;

      if (!form.name) {
        form.name = String(payload.name || payload.given_name || "").trim();
      }

      submitStatus.value = isVisitor.value
        ? "Google account verified for visitor registration."
        : "Google account verified for partner registration.";
      submitStatusType.value = "success";
    } catch {
      setGoogleVerificationError("Unable to verify Google account.");
    }
  };

  const renderGoogleButton = async () => {
    if (
      !import.meta.client ||
      (isPartner.value && currentStep.value !== 2) ||
      !googleButtonRef.value ||
      isRenderingGoogleButton.value
    ) {
      return;
    }

    if (!googleClientId.value) {
      setGoogleVerificationError(
        "Google account verification is not configured.",
      );
      return;
    }

    isRenderingGoogleButton.value = true;

    try {
      await loadGoogleIdentityScript();
      googleButtonRef.value.innerHTML = "";
      window.google?.accounts.id.initialize({
        client_id: googleClientId.value,
        callback: handleGoogleCredential,
      });
      window.google?.accounts.id.renderButton(googleButtonRef.value, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 320,
      });
    } catch {
      setGoogleVerificationError("Unable to load Google account verification.");
    } finally {
      isRenderingGoogleButton.value = false;
    }
  };

  watch(
    () => form.email,
    (email) => {
      if (
        verifiedGoogleEmail.value &&
        email.toLowerCase() !== verifiedGoogleEmail.value.toLowerCase()
      ) {
        clearGoogleVerification();
      }
    },
  );

  watch([selectedRole, currentStep], async () => {
    await nextTick();
    await renderGoogleButton();
  });

  onMounted(async () => {
    await renderGoogleButton();
  });

  const getSubmitErrorMessage = (err: unknown) => {
    if (err instanceof AxiosError) {
      const response = err.response?.data as ValidationErrorResponse | undefined;
      const firstFieldError = response?.errors
        ? Object.values(response.errors)[0]?.[0]
        : undefined;

      return (
        firstFieldError ||
        response?.message ||
        (isVisitor.value
          ? "Unable to create visitor account. Please try again."
          : "Unable to submit partner request. Please check your details.")
      );
    }

    return isVisitor.value
      ? "Unable to create visitor account. Please try again."
      : "Unable to submit partner request. Please try again.";
  };

  const handlePrimaryAction = async () => {
    submitStatus.value = "";
    submitStatusType.value = "success";

    if (isVisitor.value) {
      if (form.password !== form.confirmPassword) {
        submitStatus.value = "Passwords do not match.";
        submitStatusType.value = "error";
        return;
      }

      if (!isGoogleEmailVerified.value || !googleIdToken.value) {
        submitStatus.value =
          "Please verify your email by choosing a Google account.";
        submitStatusType.value = "error";
        await nextTick();
        await renderGoogleButton();
        return;
      }

      isSubmitting.value = true;

      try {
        const user = await auth.registerVisitorWithGoogle(
          googleIdToken.value,
          form.password,
          form.confirmPassword,
        );
        await router.replace(auth.dashboardPathFor(user));
      } catch (err) {
        submitStatus.value = getSubmitErrorMessage(err);
        submitStatusType.value = "error";
      } finally {
        isSubmitting.value = false;
      }

      return;
    }

    if (isPartner.value && currentStep.value < totalSteps.value) {
      currentStep.value += 1;
      return;
    }

    if (form.password !== form.confirmPassword) {
      submitStatus.value = "Passwords do not match.";
      submitStatusType.value = "error";
      return;
    }

    if (!isGoogleEmailVerified.value || !googleIdToken.value) {
      submitStatus.value =
        "Please verify your email by choosing a Google account.";
      submitStatusType.value = "error";
      currentStep.value = 2;
      await nextTick();
      await renderGoogleButton();
      return;
    }

    isSubmitting.value = true;

    try {
      await submitPartnerRequest({
        stateProvince: form.stateProvince,
        name: form.name,
        email: form.email,
        institutionName: form.institutionName,
        password: form.password,
        passwordConfirmation: form.confirmPassword,
        googleIdToken: googleIdToken.value,
      });

      submitStatus.value = "Your partner request was submitted.";
      submitStatusType.value = "success";
      await router.push({
        path: "/login",
        query: { role: "partner", submitted: "1" },
      });
    } catch (err) {
      submitStatus.value = getSubmitErrorMessage(err);
      submitStatusType.value = "error";
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    actionModeItems,
    currentStep,
    form,
    googleButtonRef,
    goToPreviousStep,
    handlePrimaryAction,
    headerCopy,
    headerTitle,
    isGoogleEmailVerified,
    isSubmitting,
    isVisitor,
    schoolInstitutes: schoolInstituteOptions,
    isPartner,
    primaryButtonLabel,
    selectedRole,
    stateProvinces: stateProvinceOptions,
    submitStatus,
    submitStatusType,
    totalSteps,
  };
};
