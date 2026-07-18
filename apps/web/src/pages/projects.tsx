import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, BookOpen, CheckCircle2, Download, Factory, FileText, Plus, RefreshCw, Rocket, Search, Sparkles, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { fetchCategories } from '@/features/categories/category-api';
import { createProject, deleteProject, fetchProject, fetchProjects, projectQueryKeys, updateProject, type BookProject, type ProjectPayload } from '@/features/projects/project-api';
import { fetchWorkflowContext, fetchWorkflowKnowledge, fetchWorkflowMarketIntelligence, workflowContextQueryKeys } from '@/features/workflow/workflow-context-api';
import { api } from '@/lib/api-client';

function ProjectForm({ onSubmit, onCancel, project }: { project?: BookProject; onSubmit: (payload: ProjectPayload) => void; onCancel: () => void }) {
  const categories = useQuery({ queryKey: ['categories', 'project-form'], queryFn: () => fetchCategories({ status: 'active', limit: 100 }) });
  const [title, setTitle] = useState(project?.title ?? '');
  const [subtitle, setSubtitle] = useState(project?.subtitle ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [categoryId, setCategoryId] = useState(project?.categoryId ?? '');
  const [language, setLanguage] = useState(project?.language ?? 'en');
  const [targetMarket, setTargetMarket] = useState(project?.targetMarket ?? 'US');
  const [niche, setNiche] = useState(project?.niche ?? '');
  const [estimatedWordCount, setEstimatedWordCount] = useState(String(project?.estimatedWordCount ?? 30000));
  const [estimatedChapterCount, setEstimatedChapterCount] = useState(String(project?.estimatedChapterCount ?? 10));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} /></div>
        <div className="space-y-2"><Label>Subtitle</Label><Input value={subtitle ?? ''} onChange={(event) => setSubtitle(event.target.value)} /></div>
      </div>
      <div className="space-y-2"><Label>Description</Label><Textarea value={description ?? ''} onChange={(event) => setDescription(event.target.value)} /></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>Category</Label><Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{(categories.data?.data ?? []).map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Niche</Label><Input value={niche ?? ''} onChange={(event) => setNiche(event.target.value)} /></div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2"><Label>Language</Label><Input value={language} onChange={(event) => setLanguage(event.target.value)} /></div>
        <div className="space-y-2"><Label>Market</Label><Input value={targetMarket} onChange={(event) => setTargetMarket(event.target.value)} /></div>
        <div className="space-y-2"><Label>Words</Label><Input type="number" value={estimatedWordCount} onChange={(event) => setEstimatedWordCount(event.target.value)} /></div>
        <div className="space-y-2"><Label>Chapters</Label><Input type="number" value={estimatedChapterCount} onChange={(event) => setEstimatedChapterCount(event.target.value)} /></div>
      </div>
      <DialogFooter><Button variant="outline" onClick={onCancel}>Cancel</Button><Button disabled={!title.trim() || !categoryId} onClick={() => onSubmit({ title, subtitle: subtitle || undefined, description: description || undefined, categoryId, language, targetMarket, niche: niche || undefined, estimatedWordCount: Number(estimatedWordCount), estimatedChapterCount: Number(estimatedChapterCount), targetPlatforms: ['LOCAL_EXPORT'] })}>Save project</Button></DialogFooter>
    </div>
  );
}

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const params = useMemo(() => ({ search: search || undefined, status: status === 'ALL' ? undefined : status, page, limit: 10, sortBy: 'updatedAt', sortOrder: 'desc' }), [search, status, page]);
  const projects = useQuery({ queryKey: projectQueryKeys.list(params), queryFn: () => fetchProjects(params) });
  const createMutation = useMutation({ mutationFn: createProject, onSuccess: (project) => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setCreating(false); navigate(`/projects/${project.id}`); } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight">Books & Projects</h1><p className="text-muted-foreground">Create, resume and manage database-backed publishing projects.</p></div>
        <Button onClick={() => setCreating(true)}><Plus className="mr-2 h-4 w-4" />Create Project</Button>
      </div>
      <Card><CardContent className="grid gap-4 pt-6 md:grid-cols-[1fr_220px]"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search projects" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div><Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['ALL', 'DRAFT', 'RESEARCHING', 'OUTLINE_READY', 'WRITING', 'REVIEWING', 'READY_FOR_PUBLISHING', 'PUBLISHED', 'ARCHIVED'].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></CardContent></Card>
      {projects.isLoading && <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32" />)}</div>}
      {projects.isError && <Card><CardContent className="py-10 text-center text-destructive">Unable to load projects. <Button variant="link" onClick={() => projects.refetch()}>Retry</Button></CardContent></Card>}
      {!projects.isLoading && !projects.data?.data.length && <Card><CardContent className="py-10 text-center text-muted-foreground">No book projects found.</CardContent></Card>}
      <div className="space-y-4">{(projects.data?.data ?? []).map((project) => <Card key={project.id}><CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle>{project.title}</CardTitle><CardDescription>{project.projectCode} • {project.currentStage}</CardDescription></div><Badge>{project.status}</Badge></CardHeader><CardContent className="space-y-4"><Progress value={project.progress ?? 0} /><div className="flex flex-wrap justify-end gap-2"><Button asChild variant="outline"><Link to={`/projects/${project.id}`}>Details<ArrowRight className="ml-2 h-4 w-4" /></Link></Button><Button asChild><Link to={`/generation/${project.id}`}>Continue workflow</Link></Button></div></CardContent></Card>)}</div>
      {projects.data && projects.data.meta.totalPages > 1 && <div className="flex justify-end gap-2"><Button variant="outline" disabled={!projects.data.meta.hasPrevPage} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><Button variant="outline" disabled={!projects.data.meta.hasNextPage} onClick={() => setPage((value) => value + 1)}>Next</Button></div>}
      <Dialog open={creating} onOpenChange={setCreating}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Create Book Project</DialogTitle></DialogHeader><ProjectForm onCancel={() => setCreating(false)} onSubmit={(payload) => createMutation.mutate(payload)} /></DialogContent></Dialog>
    </div>
  );
}

function StageCard({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle className="flex items-center gap-2">{icon}{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className="space-y-3">{children}</CardContent></Card>;
}

function artifactId(item: { id?: string; _id?: string }) {
  return item.id ?? item._id ?? '';
}

function artifactTitle(item: { id?: string; _id?: string; title?: string }) {
  return item.title?.trim() || item.id || item._id || 'Untitled record';
}

type BlueprintView = {
  id?: string;
  blueprintId?: string;
  title?: string;
  subtitle?: string | null;
  objective?: string;
  usp?: string;
  targetAudience?: string | null;
  readerPersona?: string | null;
  writingStyle?: string | null;
  tone?: string | null;
  estimatedWordCount?: number;
  estimatedChapterCount?: number;
  publishingStrategy?: string | null;
  chapterObjectives?: string[];
  seoKeywords?: string[];
  status?: string;
  confidenceScore?: number;
  blueprintVersion?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type OutlineView = {
  id?: string;
  outlineId?: string;
  title?: string;
  subtitle?: string | null;
  outlineSummary?: string;
  totalChapters?: number;
  estimatedWordCount?: number;
  estimatedReadingTime?: number;
  status?: string;
  aiProvider?: string;
  aiModel?: string;
  chapters?: Array<{ chapterNumber?: number; title?: string; summary?: string; estimatedWordCount?: number }>;
  createdAt?: string;
  updatedAt?: string;
};

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <div className="rounded-lg border p-3"><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-1 text-sm">{value || 'Not provided'}</div></div>;
}

export function ProjectDetailPage({ initialTab = 'overview' }: { initialTab?: string }) {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const project = useQuery({ queryKey: projectQueryKeys.detail(id), queryFn: () => fetchProject(id), enabled: Boolean(id) });
  const updateMutation = useMutation({ mutationFn: (payload: Partial<ProjectPayload> & { status?: string; currentStage?: string; progress?: number }) => updateProject(id, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }) });
  const deleteMutation = useMutation({ mutationFn: () => deleteProject(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }) });
  const latestBlueprint = useQuery<BlueprintView>({ queryKey: ['book-blueprints', id, 'latest'], queryFn: async () => (await api.get(`/book-blueprints/project/${id}/latest`)).data, enabled: Boolean(id), retry: false });
  const latestOutline = useQuery<OutlineView>({ queryKey: ['outlines', latestBlueprint.data?.id, 'latest'], queryFn: async () => (await api.get(`/outlines/blueprint/${latestBlueprint.data?.id}/latest`)).data, enabled: Boolean(latestBlueprint.data?.id), retry: false });
  const context = useQuery({ queryKey: workflowContextQueryKeys.project(id), queryFn: () => fetchWorkflowContext(id), enabled: Boolean(id), retry: false });
  const market = useQuery({ queryKey: workflowContextQueryKeys.marketIntelligence(''), queryFn: () => fetchWorkflowMarketIntelligence(''), retry: false });
  const knowledge = useQuery({ queryKey: workflowContextQueryKeys.knowledge(''), queryFn: () => fetchWorkflowKnowledge(''), retry: false });
  const exports = useQuery({ queryKey: ['exports', id], queryFn: async () => (await api.get(`/exports/project/${id}`)).data, enabled: Boolean(id), retry: false });
  const [selectedMarketId, setSelectedMarketId] = useState('');
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState('');
  const activeMarketId = selectedMarketId || context.data?.artifacts.marketIntelligence[0]?.id || '';
  const activeKnowledgeId = selectedKnowledgeId || context.data?.artifacts.knowledge[0]?.id || '';
  const blueprintMutation = useMutation<BlueprintView>({ mutationFn: async () => (await api.post('/book-blueprints/generate', { projectId: id, marketIntelligenceId: activeMarketId, knowledgeRecordId: activeKnowledgeId })).data, onSuccess: async () => { await latestBlueprint.refetch(); await context.refetch(); } });
  const outlineMutation = useMutation<OutlineView>({
    mutationFn: async () => {
      const blueprintId = context.data?.artifacts.blueprints[0]?.id ?? latestBlueprint.data?.id;

      if (latestBlueprint.data?.status !== 'APPROVED') {
        await api.patch(`/book-blueprints/${blueprintId}`, { status: 'APPROVED' });
      }

      return (await api.post('/outlines/generate', { blueprintId })).data;
    },
    onSuccess: async () => {
      await latestBlueprint.refetch();
      await latestOutline.refetch();
      await context.refetch();
    },
  });
  const exportMutation = useMutation({ mutationFn: async () => (await api.post('/exports', { projectId: id, blueprintId: context.data?.artifacts.blueprints[0]?.id, metadataId: context.data?.artifacts.metadata[0]?.id, tocId: context.data?.artifacts.tableOfContents[0]?.id, coverPromptId: context.data?.artifacts.coverPrompts[0]?.id, formats: ['PDF', 'EPUB', 'DOCX', 'ZIP'] })).data, onSuccess: () => { exports.refetch(); context.refetch(); } });
  const publishingMutation = useMutation({ mutationFn: async () => (await api.post('/publishing-workflows', { projectId: id, manuscriptVersion: String(project.data?.version ?? 1), publicationScope: 'BOTH', targets: [] })).data, onSuccess: () => context.refetch() });
  if (project.isLoading) return <Skeleton className="h-96" />;
  if (!project.data) return <Card><CardContent className="py-10 text-center text-muted-foreground">Project not found.</CardContent></Card>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight">{project.data.title}</h1><p className="text-muted-foreground">{project.data.projectCode} • {project.data.currentStage}</p></div>
        <div className="flex gap-2"><Badge>{project.data.status}</Badge><Button variant="outline" onClick={() => deleteMutation.mutate()}><Trash2 className="mr-2 h-4 w-4" />Archive</Button></div>
      </div>
      <Progress value={project.data.progress ?? 0} />
      <Tabs defaultValue={initialTab}>
        <TabsList className="flex flex-wrap"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="generation">Generation</TabsTrigger><TabsTrigger value="production">Production</TabsTrigger><TabsTrigger value="publishing">Publishing</TabsTrigger><TabsTrigger value="export">Export</TabsTrigger></TabsList>
        <TabsContent value="overview"><StageCard icon={<BookOpen className="h-5 w-5" />} title="Project Overview" description="Core project record from the Book Project API."><p className="text-sm text-muted-foreground">{project.data.description ?? 'No description provided.'}</p><Button onClick={() => updateMutation.mutate({ status: 'RESEARCHING', currentStage: 'RESEARCH', progress: Math.max(project.data.progress, 10) })}>Mark research started</Button></StageCard></TabsContent>
        <TabsContent value="generation"><StageCard icon={<Sparkles className="h-5 w-5" />} title="Generation Workflow" description="Blueprint generation is synchronous and persists validated content before completion. Outline and chapter generation use the configured AI provider."><div className="grid gap-3 md:grid-cols-2"><div className="space-y-2"><Label>Market Intelligence</Label><Select value={activeMarketId} onValueChange={setSelectedMarketId}><SelectTrigger><SelectValue placeholder="Select market intelligence" /></SelectTrigger><SelectContent>{(market.data ?? context.data?.artifacts.marketIntelligence ?? []).map((item) => <SelectItem key={artifactId(item)} value={artifactId(item)}>{artifactTitle(item)}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Knowledge</Label><Select value={activeKnowledgeId} onValueChange={setSelectedKnowledgeId}><SelectTrigger><SelectValue placeholder="Select knowledge record" /></SelectTrigger><SelectContent>{(knowledge.data ?? context.data?.artifacts.knowledge ?? []).map((item) => <SelectItem key={artifactId(item)} value={artifactId(item)}>{artifactTitle(item)}</SelectItem>)}</SelectContent></Select></div></div><div className="rounded-lg border p-3 text-sm">Generation readiness: {blueprintMutation.isPending ? 'RUNNING' : context.data?.stages.generation.readiness ?? 'loading'} {context.data?.stages.generation.blockingReason ? `• ${context.data.stages.generation.blockingReason}` : ''}</div><div className="flex flex-wrap gap-2"><Button disabled={!activeMarketId || !activeKnowledgeId || blueprintMutation.isPending} onClick={() => blueprintMutation.mutate()}>{latestBlueprint.data?.id ? <RefreshCw className="mr-2 h-4 w-4" /> : null}{latestBlueprint.data?.id ? 'Regenerate blueprint' : 'Generate blueprint'}</Button><Button disabled={!latestBlueprint.data?.id || outlineMutation.isPending} onClick={() => outlineMutation.mutate()}>Continue to outline</Button></div>{blueprintMutation.isError && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">Blueprint generation failed. Check provider configuration and required source records, then retry.</div>}{latestBlueprint.data?.id ? <div className="space-y-3 rounded-lg border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-xs uppercase tracking-wide text-muted-foreground">Latest blueprint</div><h3 className="text-xl font-semibold">{latestBlueprint.data.title}</h3><p className="text-sm text-muted-foreground">{latestBlueprint.data.subtitle}</p></div><Badge>{latestBlueprint.data.status}</Badge></div><div className="grid gap-3 md:grid-cols-2"><Field label="Target audience" value={latestBlueprint.data.targetAudience} /><Field label="Book objective" value={latestBlueprint.data.objective} /><Field label="Positioning / unique angle" value={latestBlueprint.data.usp} /><Field label="Tone and style" value={[latestBlueprint.data.tone, latestBlueprint.data.writingStyle].filter(Boolean).join(' • ')} /><Field label="Chapter strategy" value={latestBlueprint.data.chapterObjectives?.slice(0, 4).join(' ')} /><Field label="Target length" value={`${latestBlueprint.data.estimatedWordCount ?? 0} words • ${latestBlueprint.data.estimatedChapterCount ?? 0} chapters`} /><Field label="Publishing strategy" value={latestBlueprint.data.publishingStrategy} /><Field label="Provider/model" value={`${String(latestBlueprint.data.metadata?.generationProvider ?? 'deterministic-blueprint-engine')} • ${String(latestBlueprint.data.metadata?.generationModel ?? latestBlueprint.data.blueprintVersion ?? 'local')}`} /></div><div className="text-xs text-muted-foreground">Technical ID: {latestBlueprint.data.blueprintId ?? latestBlueprint.data.id} • Updated {latestBlueprint.data.updatedAt ? new Date(latestBlueprint.data.updatedAt).toLocaleString() : 'unknown'}</div></div> : <div className="rounded-lg border p-3 text-sm text-muted-foreground">No blueprint generated yet.</div>}{outlineMutation.isError && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">Outline generation failed. Approve the blueprint and verify the AI provider configuration before retrying.</div>}{latestOutline.data?.id ? <div className="space-y-3 rounded-lg border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-xs uppercase tracking-wide text-muted-foreground">Latest outline</div><h3 className="text-xl font-semibold">{latestOutline.data.title}</h3><p className="text-sm text-muted-foreground">{latestOutline.data.outlineSummary}</p></div><Badge>{latestOutline.data.status}</Badge></div><div className="grid gap-3 md:grid-cols-3"><Field label="Chapters" value={latestOutline.data.totalChapters} /><Field label="Estimated words" value={latestOutline.data.estimatedWordCount} /><Field label="AI provider/model" value={`${latestOutline.data.aiProvider ?? 'unknown'} • ${latestOutline.data.aiModel ?? 'unknown'}`} /></div><div className="space-y-2">{latestOutline.data.chapters?.slice(0, 5).map((chapter) => <div key={`${chapter.chapterNumber}-${chapter.title}`} className="rounded-lg border p-3 text-sm"><span className="font-medium">Chapter {chapter.chapterNumber}: {chapter.title}</span><p className="mt-1 text-muted-foreground">{chapter.summary}</p></div>)}</div></div> : null}</StageCard></TabsContent>
        <TabsContent value="production"><StageCard icon={<Factory className="h-5 w-5" />} title="Production Checks" description="Supported checks are exposed by backend modules and tracked from project context."><div className="rounded-lg border p-3 text-sm">Production readiness: {context.data?.stages.production.readiness ?? 'loading'} {context.data?.stages.production.blockingReason ? `• ${context.data.stages.production.blockingReason}` : ''}</div><div className="grid gap-3 md:grid-cols-2">{['Quality review', 'Content improvement', 'Plagiarism detection', 'Fact consistency', 'Compliance validation', 'Publication readiness'].map((stage) => <div key={stage} className="rounded-lg border p-3"><div className="font-medium">{stage}</div><p className="text-sm text-muted-foreground">{context.data?.stages.production.readiness === 'BLOCKED' ? context.data.stages.production.blockingReason : 'Ready to connect with resolved manuscript target.'}</p></div>)}</div></StageCard></TabsContent>
        <TabsContent value="publishing"><StageCard icon={<Rocket className="h-5 w-5" />} title="Publishing Preparation" description="Provider and marketplace actions remain capability-driven and credential-safe."><div className="rounded-lg border p-3 text-sm">Publishing readiness: {context.data?.stages.publishing.readiness ?? 'loading'} {context.data?.stages.publishing.blockingReason ? `• ${context.data.stages.publishing.blockingReason}` : ''}</div><div className="rounded-lg border p-3 text-sm"><div className="font-medium">{project.data.title}</div><div>{project.data.description ?? 'No description provided.'}</div><div className="mt-2 text-muted-foreground">Language {project.data.language} • Market {project.data.targetMarket}</div></div><Button disabled={context.data?.stages.publishing.readiness === 'BLOCKED' || publishingMutation.isPending} onClick={() => publishingMutation.mutate()}>Create publishing workflow</Button><Button asChild variant="outline"><Link to="/analytics/operations">View publishing operations</Link></Button><Button asChild variant="outline"><Link to="/settings">Review provider settings</Link></Button></StageCard></TabsContent>
        <TabsContent value="export"><StageCard icon={<Download className="h-5 w-5" />} title="Exports" description="Existing exports are listed from the Export API."><div className="rounded-lg border p-3 text-sm">Export readiness: {context.data?.stages.export.readiness ?? 'loading'} {context.data?.stages.export.blockingReason ? `• ${context.data.stages.export.blockingReason}` : ''}</div><div className="space-y-2">{(exports.data?.items ?? exports.data ?? []).map((item: { id?: string; exportJobId?: string; status?: string; format?: string; artifacts?: Array<{ downloadUrl?: string; filename?: string }> }) => <div key={item.id ?? item.exportJobId} className="flex items-center justify-between rounded-lg border p-3"><span>{item.format ?? item.exportJobId ?? item.id}</span><div className="flex items-center gap-2"><Badge>{item.status ?? 'RECORDED'}</Badge>{item.artifacts?.[0]?.downloadUrl && <Button asChild size="sm" variant="outline"><a href={item.artifacts[0].downloadUrl}>Download</a></Button>}</div></div>)}</div>{!(exports.data?.items ?? exports.data ?? []).length && <p className="text-sm text-muted-foreground">No exports found for this project.</p>}<Button disabled={context.data?.stages.export.readiness === 'BLOCKED' || exportMutation.isPending} onClick={() => exportMutation.mutate()}><FileText className="mr-2 h-4 w-4" />Start export</Button></StageCard></TabsContent>
      </Tabs>
      <div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to={`/generation/${id}`}>Generation</Link></Button><Button asChild variant="outline"><Link to={`/production/${id}`}>Production</Link></Button><Button asChild variant="outline"><Link to={`/publishing/${id}`}>Publishing</Link></Button><Button asChild variant="outline"><Link to={`/export/${id}`}>Export</Link></Button><CheckCircle2 className="h-5 w-5 text-primary" /></div>
    </div>
  );
}
