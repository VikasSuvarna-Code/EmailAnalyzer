'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui';
import { CampaignForm } from '@/components/campaigns/CampaignForm';
import { Campaign } from '@/types';

export default function NewCampaignPage() {
  const { addCampaign } = useApp();
  const router = useRouter();

  function handleSubmit(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) {
    addCampaign(data);
    router.push('/campaigns');
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Fill in the details below to track your email campaign performance.</p>
      <Card className="p-6">
        <CampaignForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/campaigns')}
        />
      </Card>
    </div>
  );
}
