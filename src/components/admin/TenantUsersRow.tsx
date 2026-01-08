import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantUsers } from "@/hooks/useTenantUsers";
import { Users, Mail, Phone } from "lucide-react";

interface TenantUsersRowProps {
  tenantId: string;
  colSpan: number;
}

export const TenantUsersRow: React.FC<TenantUsersRowProps> = ({ tenantId, colSpan }) => {
  const { users, isLoading, total } = useTenantUsers(tenantId);

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="bg-muted/30">
          <Skeleton className="h-16 w-full" />
        </TableCell>
      </TableRow>
    );
  }

  if (users.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="bg-muted/30 text-center py-4 text-muted-foreground">
          <Users className="h-4 w-4 inline mr-2" />
          No hay usuarios en este tenant
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="bg-muted/30 p-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Usuarios ({total})
          </div>
          <div className="grid gap-2">
            {users.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center gap-4 p-2 rounded-md bg-background border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    {user.email && (
                      <span className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                    )}
                    {user.phone_number && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {user.phone_number}
                      </span>
                    )}
                    {!user.email && !user.phone_number && (
                      <span className="text-sm text-muted-foreground">
                        ID: {user.user_id.substring(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant={user.is_active ? "default" : "secondary"}>
                  {user.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TenantUsersRow;
