import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAsync } from "react-use";

import { MetaResponse, getBackendMeta } from "@/backend/accounts/meta";
import { Button } from "@/components/buttons/Button";
import { Icon, Icons } from "@/components/Icon";
import {
  LargeCard,
  LargeCardButtons,
  LargeCardText,
} from "@/components/layout/LargeCard";
import { Loading } from "@/components/layout/Loading";
import { useBackendUrl } from "@/hooks/auth/useBackendUrl";

interface TrustBackendPartProps {
  backendUrl?: string | null;
  onNext?: (meta: MetaResponse) => void;
}

export function TrustBackendPart(props: TrustBackendPartProps) {
  const navigate = useNavigate();
  const defaultBackendUrl = useBackendUrl();
  const backendUrl = props.backendUrl ?? defaultBackendUrl;
  const hostname = useMemo(
    () => (backendUrl ? new URL(backendUrl).hostname : undefined),
    [backendUrl],
  );
  const result = useAsync(() => {
    if (!backendUrl) return Promise.resolve(null);
    return getBackendMeta(backendUrl);
  }, [backendUrl]);
  const { t } = useTranslation();

  // Auto-proceed when backend is reachable
  useEffect(() => {
    if (result.value) {
      props.onNext?.(result.value);
    }
  }, [result.value, props]);

  // Show loading while fetching
  if (result.loading) {
    return (
      <LargeCard>
        <Loading />
      </LargeCard>
    );
  }

  // Only show error state if failed
  if (!result.value) {
    return (
      <LargeCard>
        <LargeCardText
          title={t("auth.trust.failed.title")}
          icon={<Icon icon={Icons.CIRCLE_EXCLAMATION} />}
        >
          <p>{t("auth.trust.failed.text")}</p>
          {hostname && (
            <p className="text-sm text-type-secondary mt-1">{hostname}</p>
          )}
        </LargeCardText>
        <LargeCardButtons>
          <Button theme="secondary" onClick={() => navigate("/")}>
            {t("auth.trust.no")}
          </Button>
        </LargeCardButtons>
      </LargeCard>
    );
  }

  return null;
}
