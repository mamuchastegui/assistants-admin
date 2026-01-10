import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Eye, EyeOff, Trash2, TestTube, CreditCard, Building2 } from 'lucide-react';
import { useTenantPaymentConfig } from '@/hooks/useTenantPaymentConfig';
import { useTenantBankAccount } from '@/hooks/useTenantBankAccount';
import { useToast } from '@/components/ui/use-toast';

const Settings = () => {
  // MercadoPago state
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  // Bank account state
  const [cbu, setCbu] = useState('');
  const [alias, setAlias] = useState('');
  const [holderName, setHolderName] = useState('');

  const { toast } = useToast();

  // MercadoPago hooks
  const { useGetConfig, useSaveConfig, useDeleteConfig, useTestConfig } = useTenantPaymentConfig();
  const { data: config, isLoading: configLoading, error: configError } = useGetConfig();
  const saveConfig = useSaveConfig();
  const deleteConfig = useDeleteConfig();
  const testConfig = useTestConfig();

  // Bank account hooks
  const { useGetAccount, useSaveAccount, useDeleteAccount } = useTenantBankAccount();
  const { data: bankAccount, isLoading: bankLoading, error: bankError } = useGetAccount();
  const saveBankAccount = useSaveAccount();
  const deleteBankAccount = useDeleteAccount();

  const handleSave = async () => {
    if (!accessToken.trim()) {
      toast({
        title: 'Error',
        description: 'El access token es requerido',
        variant: 'destructive',
      });
      return;
    }

    try {
      await saveConfig.mutateAsync({ access_token: accessToken });
      toast({
        title: 'Configuracion guardada',
        description: 'La configuracion de MercadoPago se guardo exitosamente',
      });
      setAccessToken('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al guardar la configuracion',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Estas seguro de eliminar la configuracion de MercadoPago?')) {
      return;
    }

    try {
      await deleteConfig.mutateAsync();
      toast({
        title: 'Configuracion eliminada',
        description: 'La configuracion de MercadoPago fue eliminada',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar la configuracion',
        variant: 'destructive',
      });
    }
  };

  const handleTest = async () => {
    try {
      const result = await testConfig.mutateAsync();
      if (result.status === 'success') {
        toast({
          title: 'Conexion exitosa',
          description: `MercadoPago conectado correctamente. User ID: ${result.user_id}`,
        });
      } else {
        toast({
          title: 'Error de conexion',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al probar la configuracion',
        variant: 'destructive',
      });
    }
  };

  // Bank account handlers
  const handleSaveBankAccount = async () => {
    if (!cbu.trim() || !holderName.trim()) {
      toast({
        title: 'Error',
        description: 'CBU y titular son requeridos',
        variant: 'destructive',
      });
      return;
    }

    // Validate CBU format (22 digits)
    const cleanCbu = cbu.replace(/[\s\-]/g, '');
    if (!/^\d{22}$/.test(cleanCbu)) {
      toast({
        title: 'Error',
        description: 'El CBU debe tener exactamente 22 digitos',
        variant: 'destructive',
      });
      return;
    }

    try {
      await saveBankAccount.mutateAsync({
        cbu: cleanCbu,
        alias: alias.trim() || undefined,
        holder_name: holderName.trim(),
      });
      toast({
        title: 'Cuenta guardada',
        description: 'Los datos bancarios se guardaron exitosamente',
      });
      setCbu('');
      setAlias('');
      setHolderName('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al guardar los datos bancarios',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBankAccount = async () => {
    if (!confirm('Estas seguro de eliminar los datos bancarios?')) {
      return;
    }

    try {
      await deleteBankAccount.mutateAsync();
      toast({
        title: 'Cuenta eliminada',
        description: 'Los datos bancarios fueron eliminados',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar los datos bancarios',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold">Configuracion</h1>
          <p className="text-muted-foreground">
            Configura las integraciones de pago para tu negocio
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>MercadoPago</CardTitle>
                  <CardDescription>
                    Configura tu cuenta de MercadoPago para recibir pagos de membresías
                  </CardDescription>
                </div>
              </div>
              {config?.is_configured ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Configurado
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-3 h-3 mr-1" />
                  No configurado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {configLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : configError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Error al cargar la configuracion. Por favor intenta de nuevo.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {config?.is_configured && (
                  <Alert>
                    <AlertDescription className="flex items-center justify-between">
                      <span>
                        Token actual: <code className="bg-muted px-1 rounded">{config.access_token_masked}</code>
                      </span>
                      {config.updated_at && (
                        <span className="text-xs text-muted-foreground">
                          Actualizado: {new Date(config.updated_at).toLocaleDateString('es-AR')}
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="access_token">
                    {config?.is_configured ? 'Nuevo Access Token' : 'Access Token'}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="access_token"
                        type={showToken ? 'text' : 'password'}
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        placeholder="APP_USR-..."
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Obtene tu access token desde el{' '}
                    <a
                      href="https://www.mercadopago.com.ar/developers/panel/app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      panel de desarrolladores de MercadoPago
                    </a>
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={saveConfig.isPending || !accessToken.trim()}
                  >
                    {saveConfig.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {config?.is_configured ? 'Actualizar' : 'Guardar'}
                  </Button>

                  {config?.is_configured && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleTest}
                        disabled={testConfig.isPending}
                      >
                        {testConfig.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <TestTube className="w-4 h-4 mr-2" />
                        )}
                        Probar conexion
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteConfig.isPending}
                      >
                        {deleteConfig.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Eliminar
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bank Account Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Transferencia Bancaria</CardTitle>
                  <CardDescription>
                    Configura tus datos bancarios para recibir pagos por transferencia
                  </CardDescription>
                </div>
              </div>
              {bankAccount?.is_configured ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Configurado
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-3 h-3 mr-1" />
                  No configurado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {bankLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : bankError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Error al cargar los datos bancarios. Por favor intenta de nuevo.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {bankAccount?.is_configured && (
                  <Alert>
                    <AlertDescription>
                      <div className="space-y-1">
                        <div><strong>CBU:</strong> <code className="bg-muted px-1 rounded">{bankAccount.cbu_formatted}</code></div>
                        {bankAccount.alias && <div><strong>Alias:</strong> <code className="bg-muted px-1 rounded">{bankAccount.alias}</code></div>}
                        <div><strong>Titular:</strong> {bankAccount.holder_name}</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cbu">
                      {bankAccount?.is_configured ? 'Nuevo CBU' : 'CBU'}
                    </Label>
                    <Input
                      id="cbu"
                      value={cbu}
                      onChange={(e) => setCbu(e.target.value)}
                      placeholder="0000000000000000000000"
                      maxLength={22}
                    />
                    <p className="text-xs text-muted-foreground">
                      22 digitos sin espacios ni guiones
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alias">Alias (opcional)</Label>
                    <Input
                      id="alias"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value.toUpperCase())}
                      placeholder="MI.ALIAS.BANCO"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="holder_name">
                      {bankAccount?.is_configured ? 'Nuevo Titular' : 'Titular'}
                    </Label>
                    <Input
                      id="holder_name"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      placeholder="Nombre del titular de la cuenta"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSaveBankAccount}
                    disabled={saveBankAccount.isPending || !cbu.trim() || !holderName.trim()}
                  >
                    {saveBankAccount.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {bankAccount?.is_configured ? 'Actualizar' : 'Guardar'}
                  </Button>

                  {bankAccount?.is_configured && (
                    <Button
                      variant="destructive"
                      onClick={handleDeleteBankAccount}
                      disabled={deleteBankAccount.isPending}
                    >
                      {deleteBankAccount.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Eliminar
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
