"use client";

import { useId } from "react";
import { disciplines } from "@/lib/content/disciplines";
import {
  CASE_STUDY_FILTER_IDS,
  CASE_STUDY_GROUPS,
  CASE_STUDY_LIMITS as L,
  caseStudyFilterLabels,
  caseStudyGroupLabels,
} from "@/lib/case-studies/constants";
import type { CaseStudyFormValues, FormErrors } from "@/lib/admin/case-study-utils";
import { Field, Repeater, SectionTitle, describedBy, inputClass, rowErrors, ErrorText } from "./CaseStudyFormFields";

export interface SectionProps {
  values: CaseStudyFormValues;
  errors: FormErrors;
  patch: (changes: Partial<CaseStudyFormValues>) => void;
}

/* Basic information ----------------------------------------------------------------------- */

export function BasicSection({ values, errors, patch, onSlugEdit, publicSlugNote }: SectionProps & { onSlugEdit: () => void; publicSlugNote?: string }) {
  const ids = { title: useId(), slug: useId(), highlight: useId(), overview: useId(), category: useId(), group: useId(), order: useId(), featured: useId() };
  return (
    <section aria-label="Basic information" className="space-y-5">
      <SectionTitle>Basic information</SectionTitle>
      <Field id={ids.title} label="Project title" error={errors.title} count={`${values.title.length}/${L.title}`}>
        <input id={ids.title} data-autofocus value={values.title} maxLength={L.title + 20} onChange={(e) => patch({ title: e.target.value })} aria-invalid={errors.title ? true : undefined} aria-describedby={describedBy(ids.title, errors.title)} className={`${inputClass(errors.title)} h-11`} />
      </Field>
      <Field id={ids.slug} label="Slug" hint={<>Public address: /case-studies/{values.slug || "generated-from-title"}{publicSlugNote ? ` · ${publicSlugNote}` : ""}</>} error={errors.slug}>
        <input
          id={ids.slug}
          value={values.slug}
          maxLength={L.slug + 20}
          onChange={(e) => {
            onSlugEdit();
            patch({ slug: e.target.value.toLowerCase() });
          }}
          spellCheck={false}
          autoCapitalize="none"
          aria-invalid={errors.slug ? true : undefined}
          aria-describedby={describedBy(ids.slug, errors.slug, true)}
          className={`${inputClass(errors.slug)} h-11 font-mono text-[0.8125rem]`}
        />
      </Field>
      <Field id={ids.highlight} label="Project highlight" error={errors.projectHighlight} count={`${values.projectHighlight.length}/${L.highlight}`}>
        <textarea id={ids.highlight} value={values.projectHighlight} rows={2} maxLength={L.highlight + 40} onChange={(e) => patch({ projectHighlight: e.target.value })} aria-invalid={errors.projectHighlight ? true : undefined} aria-describedby={describedBy(ids.highlight, errors.projectHighlight)} className={`${inputClass(errors.projectHighlight)} resize-y py-2.5 leading-relaxed`} />
      </Field>
      <Field id={ids.overview} label="Overview" error={errors.overview} count={`${values.overview.length}/${L.overview}`}>
        <textarea id={ids.overview} value={values.overview} rows={4} maxLength={L.overview + 100} onChange={(e) => patch({ overview: e.target.value })} aria-invalid={errors.overview ? true : undefined} aria-describedby={describedBy(ids.overview, errors.overview)} className={`${inputClass(errors.overview)} resize-y py-2.5 leading-relaxed`} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={ids.category} label="Category" hint="Required to publish." error={errors.category}>
          <select id={ids.category} value={values.category} onChange={(e) => patch({ category: e.target.value as CaseStudyFormValues["category"] })} aria-invalid={errors.category ? true : undefined} aria-describedby={describedBy(ids.category, errors.category, true)} className={`${inputClass(errors.category)} h-11`}>
            <option value="">Choose a category</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id={ids.group} label="Listing group" hint="Where it appears on /case-studies." error={errors.group}>
          <select id={ids.group} value={values.group} onChange={(e) => patch({ group: e.target.value as CaseStudyFormValues["group"] })} aria-describedby={describedBy(ids.group, errors.group, true)} className={`${inputClass(errors.group)} h-11`}>
            {CASE_STUDY_GROUPS.map((g) => (
              <option key={g} value={g}>
                {caseStudyGroupLabels[g]}
              </option>
            ))}
          </select>
        </Field>
        <Field id={ids.order} label="Order" hint="Lower numbers appear first." error={errors.sortOrder}>
          <input id={ids.order} type="number" inputMode="numeric" min={0} max={L.sortOrder} step={1} value={values.sortOrder} onChange={(e) => patch({ sortOrder: e.target.value })} aria-invalid={errors.sortOrder ? true : undefined} aria-describedby={describedBy(ids.order, errors.sortOrder, true)} className={`${inputClass(errors.sortOrder)} h-11`} />
        </Field>
        <div className="flex items-end">
          <label htmlFor={ids.featured} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
            <input id={ids.featured} type="checkbox" checked={values.featured} onChange={(e) => patch({ featured: e.target.checked })} className="size-4 accent-[#5a0c14]" />
            Feature on the Home page
          </label>
        </div>
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-ink">Listing filters</legend>
        <p className="mt-0.5 text-xs text-ink-3">The filter tabs on /case-studies this project appears under.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CASE_STUDY_FILTER_IDS.map((id) => {
            const on = values.filters.includes(id);
            return (
              <label key={id} className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-burgundy ${on ? "border-[#5a0c14] bg-[#5a0c14] text-white" : "border-black/15 bg-white text-ink hover:border-black/30"}`}>
                <input type="checkbox" checked={on} onChange={() => patch({ filters: on ? values.filters.filter((f) => f !== id) : [...values.filters, id] })} className="sr-only" />
                {caseStudyFilterLabels[id]}
              </label>
            );
          })}
        </div>
        <ErrorText id="filters" error={errors.filters} />
      </fieldset>
    </section>
  );
}

/* Services ---------------------------------------------------------------------------------- */

export function ServicesSection({ values, errors, patch }: SectionProps) {
  const set = (i: number, change: Partial<CaseStudyFormValues["services"][number]>) => patch({ services: values.services.map((s, j) => (j === i ? { ...s, ...change } : s)) });
  return (
    <section aria-label="Services" className="space-y-3">
      <SectionTitle note="The project's own service labels. Linking one to the catalog is optional.">Services</SectionTitle>
      <Repeater
        legend="Services"
        items={values.services}
        max={L.services}
        addLabel="Add service"
        empty="At least one service is needed to publish."
        onAdd={() => patch({ services: [...values.services, { name: "", serviceId: "" }] })}
        onRemove={(i) => patch({ services: values.services.filter((_, j) => j !== i) })}
        groupError={errors.services}
        render={(s, i, id) => {
          const e = rowErrors(errors, "services", i);
          return (
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label htmlFor={`${id}-name`} className="sr-only">Service {i + 1} name</label>
                <input id={`${id}-name`} value={s.name} placeholder="e.g. Brand Positioning" maxLength={L.serviceName + 10} onChange={(ev) => set(i, { name: ev.target.value })} aria-invalid={e.name || errors[`services.${i}`] ? true : undefined} className={`${inputClass(e.name ?? errors[`services.${i}`])} h-11`} />
                <ErrorText id={`${id}-name`} error={e.name ?? errors[`services.${i}`]} />
              </div>
              <div>
                <label htmlFor={`${id}-cat`} className="sr-only">Service {i + 1} catalog link</label>
                <select id={`${id}-cat`} value={s.serviceId} onChange={(ev) => set(i, { serviceId: ev.target.value })} className={`${inputClass(e.serviceId)} h-11`}>
                  <option value="">No catalog link</option>
                  {disciplines.map((d) => (
                    <optgroup key={d.id} label={d.name}>
                      {d.services.map((cs) => (
                        <option key={cs.id} value={cs.id}>
                          {cs.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ErrorText id={`${id}-cat`} error={e.serviceId} />
              </div>
            </div>
          );
        }}
      />
    </section>
  );
}

/* Scope and results ----------------------------------------------------------------------- */

export function FiguresSection({ values, errors, patch }: SectionProps) {
  const setScope = (i: number, c: Partial<CaseStudyFormValues["scope"][number]>) => patch({ scope: values.scope.map((s, j) => (j === i ? { ...s, ...c } : s)) });
  const setResult = (i: number, c: Partial<CaseStudyFormValues["results"][number]>) => patch({ results: values.results.map((r, j) => (j === i ? { ...r, ...c } : r)) });
  return (
    <section aria-label="Scope and results" className="space-y-5">
      <SectionTitle note="Both optional. Use only supplied figures: nothing is required to publish.">Scope and results</SectionTitle>
      <Repeater
        legend="Project scope"
        items={values.scope}
        max={L.scopeItems}
        addLabel="Add scope item"
        onAdd={() => patch({ scope: [...values.scope, { value: "", title: "", description: "" }] })}
        onRemove={(i) => patch({ scope: values.scope.filter((_, j) => j !== i) })}
        groupError={errors.scope}
        render={(s, i, id) => {
          const e = rowErrors(errors, "scope", i);
          return (
            <div className="grid gap-2 sm:grid-cols-[7rem_1fr]">
              <div>
                <label htmlFor={`${id}-v`} className="sr-only">Scope {i + 1} figure (optional)</label>
                <input id={`${id}-v`} value={s.value} placeholder="Figure" maxLength={L.resultValue + 5} onChange={(ev) => setScope(i, { value: ev.target.value })} className={`${inputClass(e.value)} h-11`} />
                <ErrorText id={`${id}-v`} error={e.value} />
              </div>
              <div>
                <label htmlFor={`${id}-t`} className="sr-only">Scope {i + 1} title</label>
                <input id={`${id}-t`} value={s.title} placeholder="e.g. Brand Touchpoints" maxLength={L.scopeTitle + 10} onChange={(ev) => setScope(i, { title: ev.target.value })} aria-invalid={e.title ? true : undefined} className={`${inputClass(e.title)} h-11`} />
                <ErrorText id={`${id}-t`} error={e.title} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${id}-d`} className="sr-only">Scope {i + 1} description (optional)</label>
                <input id={`${id}-d`} value={s.description} placeholder="Description (optional)" maxLength={L.scopeDescription + 10} onChange={(ev) => setScope(i, { description: ev.target.value })} className={`${inputClass(e.description)} h-10`} />
                <ErrorText id={`${id}-d`} error={e.description} />
              </div>
            </div>
          );
        }}
      />
      <Repeater
        legend="Results"
        items={values.results}
        max={L.results}
        addLabel="Add result"
        onAdd={() => patch({ results: [...values.results, { value: "", label: "" }] })}
        onRemove={(i) => patch({ results: values.results.filter((_, j) => j !== i) })}
        groupError={errors.results}
        render={(r, i, id) => {
          const e = rowErrors(errors, "results", i);
          const dup = errors[`results.${i}`];
          return (
            <div className="grid gap-2 sm:grid-cols-[7rem_1fr]">
              <div>
                <label htmlFor={`${id}-v`} className="sr-only">Result {i + 1} value</label>
                <input id={`${id}-v`} value={r.value} placeholder="25%" maxLength={L.resultValue + 5} onChange={(ev) => setResult(i, { value: ev.target.value })} aria-invalid={e.value ? true : undefined} className={`${inputClass(e.value)} h-11`} />
                <ErrorText id={`${id}-v`} error={e.value} />
              </div>
              <div>
                <label htmlFor={`${id}-l`} className="sr-only">Result {i + 1} label</label>
                <input id={`${id}-l`} value={r.label} placeholder="Sales Growth" maxLength={L.resultLabel + 10} onChange={(ev) => setResult(i, { label: ev.target.value })} aria-invalid={e.label || dup ? true : undefined} className={`${inputClass(e.label ?? dup)} h-11`} />
                <ErrorText id={`${id}-l`} error={e.label ?? dup} />
              </div>
            </div>
          );
        }}
      />
    </section>
  );
}
