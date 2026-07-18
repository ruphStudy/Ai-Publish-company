import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Flag, KeyRound, RotateCcw, Save, Search, Settings2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { fetchSettingCategories, fetchSettings, resetSettingToInherited, settingsQueryKeys, updateSetting } from './settings-api';
import type { ResolvedSetting, SettingCategory, SettingDataType, SettingScope, SettingValue } from './types';

const writableScopes: SettingScope[] = ['SYSTEM', 'WORKSPACE', 'PROJECT', 'USER', 'PROVIDER', 'MARKETPLACE'];

function label(value: string) {
  return value.replace(/_/g, ' ').toLowerCase();
}

function parseValue(type: SettingDataType, value: string | boolean): SettingValue {
  if (type === 'BOOLEAN') return Boolean(value);
  if (type === 'NUMBER' || type === 'DECIMAL') return Number(value);
  if (type === 'JSON' || type === 'MAP' || type === 'LIST') return JSON.parse(String(value));
  return String(value);
}

function SettingField({ setting }: { setting: ResolvedSetting }) {
  const queryClient = useQueryClient();
  const [scope, setScope] = useState<SettingScope>(setting.sourceScope === 'DEFAULT' ? 'SYSTEM' : setting.sourceScope);
  const [scopeId, setScopeId] = useState(setting.sourceScopeId ?? '');
  const [draft, setDraft] = useState(() => (setting.definition.dataType === 'SECRET' ? '' : typeof setting.value === 'object' ? JSON.stringify(setting.value, null, 2) : String(setting.value ?? '')));
  const [error, setError] = useState<string | null>(null);
  const definition = setting.definition;
  const secretConfigured = definition.dataType === 'SECRET' && setting.value === '********';

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['settings'] });
  const updateMutation = useMutation({ mutationFn: () => updateSetting(setting.key, { scope, scopeId: scope === 'SYSTEM' ? null : scopeId || null, value: parseValue(definition.dataType, draft) }), onSuccess: () => { if (definition.dataType === 'SECRET') setDraft(''); invalidate(); }, onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : 'Unable to save setting') });
  const resetMutation = useMutation({ mutationFn: () => resetSettingToInherited(setting.key, { scope, scopeId: scope === 'SYSTEM' ? null : scopeId || null }), onSuccess: invalidate });

  const control = definition.dataType === 'BOOLEAN' ? (
    <Switch checked={draft === 'true'} onCheckedChange={(checked) => setDraft(String(checked))} />
  ) : definition.dataType === 'JSON' || definition.dataType === 'MAP' || definition.dataType === 'LIST' ? (
    <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} className="min-h-24 font-mono text-xs" />
  ) : definition.allowedValues?.length ? (
    <Select value={draft} onValueChange={setDraft}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{definition.allowedValues.map((item) => <SelectItem key={String(item)} value={String(item)}>{String(item)}</SelectItem>)}</SelectContent>
    </Select>
  ) : (
    <Input type={definition.dataType === 'SECRET' ? 'password' : definition.dataType === 'NUMBER' || definition.dataType === 'DECIMAL' ? 'number' : 'text'} value={draft} placeholder={secretConfigured ? 'Configured — enter replacement value to rotate' : undefined} onChange={(event) => setDraft(event.target.value)} />
  );

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              {definition.encrypted ? <KeyRound className="h-4 w-4" /> : definition.category === 'FEATURE_FLAGS' ? <Flag className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
              {definition.displayName}
            </CardTitle>
            <CardDescription>{definition.description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={setting.inherited ? 'outline' : 'default'}>{setting.inherited ? 'inherited' : 'override'}</Badge>
            <Badge variant="secondary">{label(setting.sourceScope)}</Badge>
            {definition.restartRequired && <Badge variant="warning">restart required</Badge>}
            {definition.encrypted && <Badge variant="info">masked secret</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_180px_220px]">
          <div className="space-y-2">
            <Label>{definition.key}</Label>
            {control}
            {secretConfigured && <p className="text-xs text-muted-foreground">Current secret is configured and masked. Saving requires a replacement value and rotates the secret without revealing it.</p>}
          </div>
          <div className="space-y-2">
            <Label>Scope</Label>
            <Select value={scope} onValueChange={(value) => setScope(value as SettingScope)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{writableScopes.filter((item) => definition.scopes.includes(item)).map((item) => <SelectItem key={item} value={item}>{label(item)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Scope ID</Label>
            <Input value={scopeId} disabled={scope === 'SYSTEM'} placeholder={scope === 'SYSTEM' ? 'global' : 'workspace/project/user id'} onChange={(event) => setScopeId(event.target.value)} />
          </div>
        </div>
        {error && <p className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending}><RotateCcw className="mr-2 h-4 w-4" />Reset inherited</Button>
          <Button onClick={() => { setError(null); updateMutation.mutate(); }} disabled={updateMutation.isPending || (definition.dataType === 'SECRET' && draft.length === 0)}><Save className="mr-2 h-4 w-4" />{definition.dataType === 'SECRET' ? 'Rotate secret' : 'Save override'}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsEnginePage() {
  const [category, setCategory] = useState<SettingCategory | undefined>();
  const [search, setSearch] = useState('');
  const categoriesQuery = useQuery({ queryKey: settingsQueryKeys.categories, queryFn: fetchSettingCategories });
  const settingsQuery = useQuery({ queryKey: settingsQueryKeys.values(category, search), queryFn: () => fetchSettings(category, search) });
  const settings = settingsQuery.data?.items ?? [];
  const featureFlags = useMemo(() => settings.filter((setting) => setting.definition.category === 'FEATURE_FLAGS'), [settings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Centralized configuration, inheritance, secrets and feature flags.</p>
        </div>
        <Badge variant="success" className="gap-2"><CheckCircle2 className="h-3.5 w-3.5" />Registry driven</Badge>
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-[240px_1fr]">
          <Select value={category ?? 'ALL'} onValueChange={(value) => setCategory(value === 'ALL' ? undefined : value as SettingCategory)}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">all categories</SelectItem>
              {(categoriesQuery.data ?? []).map((item) => <SelectItem key={item.key} value={item.key}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search settings, feature flags, secrets or providers" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </CardContent>
      </Card>

      {featureFlags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>Feature evaluation uses effective values from the Settings Engine.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {featureFlags.map((flag) => (
              <div key={flag.key} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{flag.definition.displayName}</span>
                  <Badge variant={flag.value === true ? 'success' : 'outline'}>{flag.value === true ? 'enabled' : 'disabled'}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{flag.definition.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {settingsQuery.isLoading ? <Card><CardContent className="py-10 text-center text-muted-foreground">Loading settings…</CardContent></Card> : settings.map((setting) => <SettingField key={setting.key} setting={setting} />)}
        {!settingsQuery.isLoading && settings.length === 0 && <Card><CardContent className="py-10 text-center text-muted-foreground">No settings found.</CardContent></Card>}
      </div>
    </div>
  );
}
