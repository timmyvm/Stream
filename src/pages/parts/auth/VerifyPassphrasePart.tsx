import { useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useTranslation } from "react-i18next";
import { useAsyncFn } from "react-use";

import { authenticatePasskey } from "@/backend/accounts/crypto";
import { updateSettings } from "@/backend/accounts/settings";
import { Button } from "@/components/buttons/Button";
import { Icon, Icons } from "@/components/Icon";
import {
  LargeCard,
  LargeCardButtons,
  LargeCardText,
} from "@/components/layout/LargeCard";
import { Loading } from "@/components/layout/Loading";
import { useAuth } from "@/hooks/auth/useAuth";
import { useBackendUrl } from "@/hooks/auth/useBackendUrl";
import { AccountProfile } from "@/pages/parts/auth/AccountCreatePart";
import { useBookmarkStore } from "@/stores/bookmarks";
import { useLanguageStore } from "@/stores/language";
import { usePreferencesStore } from "@/stores/preferences";
import { useProgressStore } from "@/stores/progress";
import { useSubtitleStore } from "@/stores/subtitles";
import { useThemeStore } from "@/stores/theme";

interface VerifyPassphraseProps {
  mnemonic: string | null;
  credentialId: string | null;
  authMethod: "mnemonic" | "passkey";
  hasCaptcha?: boolean;
  userData: AccountProfile | null;
  backendUrl: string | null;
  onNext?: () => void;
}

export function VerifyPassphrase(props: VerifyPassphraseProps) {
  const { register, restore, importData } = useAuth();
  const progressItems = useProgressStore((store) => store.items);
  const bookmarkItems = useBookmarkStore((store) => store.bookmarks);

  const applicationLanguage = useLanguageStore((store) => store.language);
  const defaultSubtitleLanguage = useSubtitleStore(
    (store) => store.lastSelectedLanguage,
  );
  const applicationTheme = useThemeStore((store) => store.theme);

  const preferences = usePreferencesStore((store) => ({
    enableThumbnails: store.enableThumbnails,
    enableAutoplay: store.enableAutoplay,
    enableSkipCredits: store.enableSkipCredits,
    enableDiscover: store.enableDiscover,
    enableFeatured: store.enableFeatured,
    enableDetailsModal: store.enableDetailsModal,
    enableImageLogos: store.enableImageLogos,
    enableCarouselView: store.enableCarouselView,
    forceCompactEpisodeView: store.forceCompactEpisodeView,
    sourceOrder: store.sourceOrder,
    enableSourceOrder: store.enableSourceOrder,
    embedOrder: store.embedOrder,
    enableEmbedOrder: store.enableEmbedOrder,
    proxyTmdb: store.proxyTmdb,
    febboxKey: store.febboxKey,
    debridToken: store.debridToken,
    debridService: store.debridService,
    enableLowPerformanceMode: store.enableLowPerformanceMode,
    enableNativeSubtitles: store.enableNativeSubtitles,
    enableHoldToBoost: store.enableHoldToBoost,
    homeSectionOrder: store.homeSectionOrder,
    enableDoubleClickToSeek: store.enableDoubleClickToSeek,
    manualSourceSelection: store.manualSourceSelection,
    enableAutoResumeOnPlaybackError: store.enableAutoResumeOnPlaybackError,
  }));

  const backendUrl = useBackendUrl();
  const { t } = useTranslation();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [passkeyResult, authenticatePasskeyFn] = useAsyncFn(async () => {
    if (!props.backendUrl)
      throw new Error(t("auth.verify.noBackendUrl") ?? undefined);
    if (!props.userData)
      throw new Error(t("auth.verify.invalidData") ?? undefined);

    if (
      !props.credentialId ||
      typeof props.credentialId !== "string" ||
      props.credentialId.length === 0
    ) {
      throw new Error(
        t("auth.verify.invalidData") ?? "Invalid passkey credential",
      );
    }

    let recaptchaToken: string | undefined;
    if (props.hasCaptcha) {
      recaptchaToken = executeRecaptcha ? await executeRecaptcha() : undefined;
      if (!recaptchaToken)
        throw new Error(t("auth.verify.recaptchaFailed") ?? undefined);
    }

    const assertion = await authenticatePasskey(props.credentialId);

    if (assertion.id !== props.credentialId) {
      throw new Error(
        t("auth.verify.noMatch") ?? "Passkey verification failed",
      );
    }

    const account = await register({
      credentialId: props.credentialId,
      userData: props.userData,
      recaptchaToken,
    });

    if (!account)
      throw new Error(t("auth.verify.registrationFailed") ?? undefined);

    await importData(account, progressItems, bookmarkItems);

    await updateSettings(props.backendUrl, account, {
      applicationLanguage,
      defaultSubtitleLanguage: defaultSubtitleLanguage ?? undefined,
      applicationTheme: applicationTheme ?? undefined,
      proxyUrls: undefined,
      ...preferences,
    });

    await restore(account);

    props.onNext?.();
  }, [props, register, restore, executeRecaptcha]);

  // Auto-register for mnemonic auth — no need to re-type passphrase
  const [mnemonicResult, registerWithMnemonic] = useAsyncFn(async () => {
    if (!backendUrl)
      throw new Error(t("auth.verify.noBackendUrl") ?? undefined);
    if (!props.mnemonic || !props.userData)
      throw new Error(t("auth.verify.invalidData") ?? undefined);

    let recaptchaToken: string | undefined;
    if (props.hasCaptcha) {
      recaptchaToken = executeRecaptcha ? await executeRecaptcha() : undefined;
      if (!recaptchaToken)
        throw new Error(t("auth.verify.recaptchaFailed") ?? undefined);
    }

    const account = await register({
      mnemonic: props.mnemonic,
      userData: props.userData,
      recaptchaToken,
    });

    if (!account)
      throw new Error(t("auth.verify.registrationFailed") ?? undefined);

    await importData(account, progressItems, bookmarkItems);

    await updateSettings(backendUrl, account, {
      applicationLanguage,
      defaultSubtitleLanguage: defaultSubtitleLanguage ?? undefined,
      applicationTheme: applicationTheme ?? undefined,
      proxyUrls: undefined,
      ...preferences,
    });

    await restore(account);

    props.onNext?.();
  }, [props, register, restore, executeRecaptcha]);

  useEffect(() => {
    if (props.authMethod === "mnemonic") {
      registerWithMnemonic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.authMethod]);

  if (props.authMethod === "passkey") {
    return (
      <LargeCard>
        <form>
          <LargeCardText
            icon={<Icon icon={Icons.CIRCLE_CHECK} />}
            title={t("auth.verify.title")}
          >
            {t("auth.verify.passkeyDescription")}
          </LargeCardText>
          {passkeyResult.error ? (
            <p className="mt-3 text-authentication-errorText">
              {t("auth.verify.passkeyError")}
            </p>
          ) : null}
          <LargeCardButtons>
            <Button
              theme="purple"
              loading={passkeyResult.loading}
              onClick={() => authenticatePasskeyFn()}
            >
              {!passkeyResult.loading && (
                <Icon icon={Icons.LOCK} className="mr-2" />
              )}
              {t("auth.verify.authenticatePasskey")}
            </Button>
          </LargeCardButtons>
        </form>
      </LargeCard>
    );
  }

  // Mnemonic: show loading while auto-registering, error if failed
  return (
    <LargeCard>
      {mnemonicResult.loading ||
      (!mnemonicResult.error && !mnemonicResult.value) ? (
        <Loading />
      ) : mnemonicResult.error ? (
        <>
          <LargeCardText
            icon={<Icon icon={Icons.CIRCLE_EXCLAMATION} />}
            title={t("auth.verify.failed") ?? "Registration failed"}
          >
            {mnemonicResult.error.message}
          </LargeCardText>
          <LargeCardButtons>
            <Button theme="purple" onClick={() => registerWithMnemonic()}>
              {t("actions.retry") ?? "Retry"}
            </Button>
          </LargeCardButtons>
        </>
      ) : null}
    </LargeCard>
  );
}
