
import React from "react";
import { Phone, Copy, Check } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AssistantConfig from "@/components/assistant/AssistantConfig";
import { useNotifications } from "@/providers/NotificationsProvider";
import { useTenantInfo } from "@/hooks/useTenantInfo";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Assistant = () => {
  const { count } = useNotifications();
  const { data: tenantInfo, isLoading: isLoadingTenant } = useTenantInfo();
  const [copiedPhone, setCopiedPhone] = React.useState(false);

  const primaryPhone = tenantInfo?.phones?.primary_phone_id;

  const copyPhone = async () => {
    if (primaryPhone) {
      await navigator.clipboard.writeText(primaryPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 h-full max-h-screen overflow-hidden">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Chat de WhatsApp {count > 0 && `(${count})`}
            </h1>
            {primaryPhone && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="gap-1.5 cursor-pointer hover:bg-muted" onClick={copyPhone}>
                      <Phone className="h-3 w-3" />
                      <span className="font-mono text-xs">{primaryPhone}</span>
                      {copiedPhone ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-50" />
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>WhatsApp Business Phone ID - Click para copiar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Visualiza y responde a todas las conversaciones de WhatsApp con tus clientes.
          </p>
        </div>

        <AssistantConfig />
      </div>
    </DashboardLayout>
  );
};

export default Assistant;
