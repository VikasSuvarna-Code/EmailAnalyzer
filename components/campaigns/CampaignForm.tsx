'use client';
import { useState } from 'react';
import { Campaign, CampaignType } from '@/types';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { CAMPAIGN_TYPES } from '@/lib/constants';

interface CampaignFormProps {
  initial?: Partial<Campaign>;
  onSubmit: (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

type FormErrors = Partial<Record<keyof Campaign | 'cross', string>>;

const EMPTY: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  subjectLine: '',
  type: 'Newsletter',
  audience: '',
  emailsSent: 0,
  emailsDelivered: 0,
  emailsOpened: 0,
  emailsClicked: 0,
  conversions: 0,
  emailsBounced: 0,
  date: new Date().toISOString().split('T')[0],
  notes: '',
  isCompleted: false,
};

export function CampaignForm({ initial, onSubmit, onCancel, submitLabel = 'Save Campaign' }: CampaignFormProps) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }));
  const [errors, setErrors] = useState<FormErrors>({});

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined, cross: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Campaign name is required.';
    if (!form.subjectLine.trim()) e.subjectLine = 'Subject line is required.';
    if (!form.audience.trim()) e.audience = 'Audience is required.';
    if (!form.date) e.date = 'Date is required.';

    const sent = Number(form.emailsSent);
    const delivered = Number(form.emailsDelivered);
    const opened = Number(form.emailsOpened);
    const clicked = Number(form.emailsClicked);
    const conversions = Number(form.conversions);
    const bounced = Number(form.emailsBounced);

    if (!Number.isInteger(sent) || sent < 1) e.emailsSent = 'Emails sent must be a whole number ≥ 1.';
    if (!Number.isInteger(delivered) || delivered < 0) e.emailsDelivered = 'Must be ≥ 0.';
    if (!Number.isInteger(opened) || opened < 0) e.emailsOpened = 'Must be ≥ 0.';
    if (!Number.isInteger(clicked) || clicked < 0) e.emailsClicked = 'Must be ≥ 0.';
    if (!Number.isInteger(conversions) || conversions < 0) e.conversions = 'Must be ≥ 0.';
    if (!Number.isInteger(bounced) || bounced < 0) e.emailsBounced = 'Must be ≥ 0.';

    if (!e.emailsSent && !e.emailsDelivered && delivered > sent)
      e.emailsDelivered = 'Delivered cannot exceed emails sent.';
    if (!e.emailsDelivered && !e.emailsOpened && opened > delivered)
      e.emailsOpened = 'Opened cannot exceed delivered emails.';
    if (!e.emailsOpened && !e.emailsClicked && clicked > opened)
      e.emailsClicked = 'Clicked cannot exceed opened emails.';
    if (!e.emailsClicked && !e.conversions && conversions > clicked)
      e.conversions = 'Conversions cannot exceed clicked emails.';
    if (!e.emailsSent && !e.emailsBounced && bounced > sent)
      e.emailsBounced = 'Bounces cannot exceed emails sent.';

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      emailsSent: Number(form.emailsSent),
      emailsDelivered: Number(form.emailsDelivered),
      emailsOpened: Number(form.emailsOpened),
      emailsClicked: Number(form.emailsClicked),
      conversions: Number(form.conversions),
      emailsBounced: Number(form.emailsBounced),
    });
  }

  const typeOptions = CAMPAIGN_TYPES.map(t => ({ value: t, label: t }));

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Campaign Name"
          value={form.name}
          onChange={e => setField('name', e.target.value)}
          error={errors.name}
          placeholder="Spring Newsletter"
          required
        />
        <Input
          label="Subject Line"
          value={form.subjectLine}
          onChange={e => setField('subjectLine', e.target.value)}
          error={errors.subjectLine}
          placeholder="What's new this month"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Campaign Type"
          value={form.type}
          onChange={e => setField('type', e.target.value as CampaignType)}
          options={typeOptions}
          required
        />
        <Input
          label="Audience / Segment"
          value={form.audience}
          onChange={e => setField('audience', e.target.value)}
          error={errors.audience}
          placeholder="All Subscribers"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Campaign Date"
          type="date"
          value={form.date}
          onChange={e => setField('date', e.target.value)}
          error={errors.date}
          required
        />
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isCompleted}
              onChange={e => setField('isCompleted', e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600"
            />
            Mark as completed
          </label>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Email Metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Input label="Emails Sent" type="number" min="1" value={form.emailsSent} onChange={e => setField('emailsSent', Number(e.target.value))} error={errors.emailsSent} required />
          <Input label="Delivered" type="number" min="0" value={form.emailsDelivered} onChange={e => setField('emailsDelivered', Number(e.target.value))} error={errors.emailsDelivered} />
          <Input label="Opened" type="number" min="0" value={form.emailsOpened} onChange={e => setField('emailsOpened', Number(e.target.value))} error={errors.emailsOpened} />
          <Input label="Clicked" type="number" min="0" value={form.emailsClicked} onChange={e => setField('emailsClicked', Number(e.target.value))} error={errors.emailsClicked} />
          <Input label="Conversions" type="number" min="0" value={form.conversions} onChange={e => setField('conversions', Number(e.target.value))} error={errors.conversions} />
          <Input label="Bounced" type="number" min="0" value={form.emailsBounced} onChange={e => setField('emailsBounced', Number(e.target.value))} error={errors.emailsBounced} />
        </div>
      </div>

      <Textarea
        label="Notes (optional)"
        value={form.notes}
        onChange={e => setField('notes', e.target.value)}
        rows={3}
        placeholder="Any notes about this campaign..."
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">{submitLabel}</Button>
      </div>
    </form>
  );
}
