import { AxiosError } from "axios";
import { stateProvinceOptions, schoolInstituteOptions } from "~/constants/auth";
import { submitPartnerRequest } from "~/services/admin.service";
import type { RegistrationRole } from "~/types/auth";

type ValidationErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleJwtPayload = {
  email?: string;
  email_verified?: boolean | string;
  given_name?: string;
  family_name?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | boolean | number>,
          ) => void;
        };
      };
    };
  }
}

const googleScriptSrc = "https://accounts.google.com/gsi/client";
let googleScriptPromise: Promise<void> | null = null;

const loadGoogleIdentityScript = () => {
  if (!import.meta.client) {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${googleScriptSrc}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = googleScriptSrc;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

const decodeGoogleJwtPayload = (token: string): GoogleJwtPayload => {
  const payload = token.split(".")[1];

  if (!payload) {
    return {};
  }

  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  const paddedPayload = normalizedPayload.padEnd(
    normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
    "=",
  );
  const decodedPayload = atob(paddedPayload);

  return JSON.parse(decodedPayload) as GoogleJwtPayload;
};

export const useSignupForm = () => {
  const auth = useAuthStore();
  const route = useRoute();
  const router = useRouter();
  const runtimeConfig = useRuntimeConfig();
  const routeRole =
    route.query.role === "partner" || route.query.role === "visitor"
      ? route.query.role
      : "visitor";

  const selectedRole = ref<RegistrationRole>(routeRole);
  const currentStep = ref(1);
  const submitStatus = ref("");
  const submitStatusType = ref<"success" | "error">("success");
  const isSubmitting = ref(false);
  const idCardPreviewUrl = ref("");
  const googleButtonRef = ref<HTMLElement | null>(null);
  const googleIdToken = ref("");
  const verifiedGoogleEmail = ref("");
  const isRenderingGoogleButton = ref(false);

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
  const googleClientId = computed(
    () => String(runtimeConfig.public.googleClientId || ""),
  );
  const isGoogleEmailVerified = computed(
    () =>
      verifiedGoogleEmail.value !== "" &&
      verifiedGoogleEmail.value.toLowerCase() === form.email.toLowerCase(),
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

      if (!form.firstName && payload.given_name) {
        form.firstName = payload.given_name;
      }

      if (!form.lastName && payload.family_name) {
        form.lastName = payload.family_name;
      }

      submitStatus.value = "Google account verified for partner registration.";
      submitStatusType.value = "success";
    } catch {
      setGoogleVerificationError("Unable to verify Google account.");
    }
  };

  const renderGoogleButton = async () => {
    if (
      !import.meta.client ||
      !isPartner.value ||
      currentStep.value !== 2 ||
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

  watch([isPartner, currentStep], async () => {
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
        "Unable to submit partner request. Please check your details."
      );
    }

    return "Unable to submit partner request. Please try again.";
  };

  const handlePrimaryAction = async () => {
    submitStatus.value = "";
    submitStatusType.value = "success";

    if (isPartner.value && currentStep.value < totalSteps.value) {
      if (currentStep.value === 2 && !isGoogleEmailVerified.value) {
        submitStatus.value =
          "Please verify your email by choosing a Google account.";
        submitStatusType.value = "error";
        await nextTick();
        await renderGoogleButton();
        return;
      }

      currentStep.value += 1;
      return;
    }

    if (selectedRole.value === "visitor") {
      if (form.password !== form.confirmPassword) {
        submitStatus.value = "Passwords do not match.";
        submitStatusType.value = "error";
        return;
      }

      try {
        await auth.registerVisitor({
          name: form.fullName || `${form.firstName} ${form.lastName}`.trim() || "Visitor User",
          email: form.email,
          password: form.password,
          password_confirmation: form.confirmPassword,
        });

        submitStatus.value = "Account created successfully.";
        submitStatusType.value = "success";
        await router.push({
          path: "/login",
          query: { role: "visitor", registered: "1" },
        });
      } catch (err) {
        submitStatus.value = getSubmitErrorMessage(err);
        submitStatusType.value = "error";
      }

      return;
    }

    if (form.password !== form.confirmPassword) {
      submitStatus.value = "Passwords do not match.";
      submitStatusType.value = "error";
      return;
    }

    if (!form.idCard) {
      submitStatus.value = "Please upload your institute affiliation document.";
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
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        institutionName: form.institutionName,
        idCard: form.idCard,
        password: form.password,
        passwordConfirmation: form.confirmPassword,
        googleIdToken: googleIdToken.value,
      });

      submitStatus.value = "Your partner request was submitted for Manager review.";
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
    idCardPreviewType,
    idCardPreviewUrl,
    isGoogleEmailVerified,
    isSubmitting,
    schoolInstitutes: schoolInstituteOptions,
    isPartner,
    isPartnerReviewStep,
    primaryButtonLabel,
    reviewItems,
    selectedRole,
    stateProvinces: stateProvinceOptions,
    submitStatus,
    submitStatusType,
    totalSteps,
    updateIdCardFile,
  };
};
